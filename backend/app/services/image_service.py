from datetime import UTC, datetime
from pathlib import Path

from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

from app.mocks.openai_vision import mock_openai_vision_analysis
from app.repositories import ImageNotFoundError, ImageRecord, history_repo, image_repo
from app.utils.ids import generate_image_id
from app.validation.images import validate_image


def upload_image(file: FileStorage | None, upload_folder: str) -> dict:
    mime_type = validate_image(file)
    assert file is not None  # validate_image raises if file is None

    image_id = generate_image_id()
    original_name = secure_filename(file.filename or "") or "unnamed"
    stored_name = f"{image_id}_{original_name}"

    folder = Path(upload_folder).resolve()
    folder.mkdir(parents=True, exist_ok=True)
    file_path = folder / stored_name
    file.save(file_path)

    record = ImageRecord(
        id=image_id,
        filename=original_name,
        size_bytes=file_path.stat().st_size,
        mime_type=mime_type,
        uploaded_at=datetime.now(UTC),
        file_path=str(file_path),
    )
    image_repo.save(record)

    analysis = mock_openai_vision_analysis(str(file_path))

    return {
        "image_id": record.id,
        "filename": record.filename,
        "size_bytes": record.size_bytes,
        "uploaded_at": record.uploaded_at.isoformat(),
        "analysis": analysis,
    }


def delete_image(image_id: str) -> None:
    record = image_repo.get(image_id)
    if record is None:
        raise ImageNotFoundError(image_id)

    # Clear any chat history for this image.
    # For the DB repo this is redundant (session.delete cascades), but it
    # keeps the in-memory repo consistent and avoids leaking history rows
    # if the ORM cascade is ever reconfigured.
    history_repo.clear(image_id)

    # Best-effort file deletion. The DB record is the source of truth; a
    # missing file is not an error (it may have been cleaned up already).
    try:
        Path(record.file_path).unlink(missing_ok=True)
    except OSError:
        pass

    image_repo.delete(image_id)
