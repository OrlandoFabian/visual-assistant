import contextlib
from datetime import UTC, datetime
from pathlib import Path

from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

from app.mocks.openai_vision import mock_openai_vision_analysis
from app.mocks.responses import extract_text
from app.repositories import ImageNotFoundError, ImageRecord, history_repo, image_repo
from app.utils.ids import generate_image_id
from app.validation.images import validate_image


def upload_image(file: FileStorage | None, upload_folder: str) -> dict:
    mime_type = validate_image(file)
    assert file is not None

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

    history_repo.add_message(
        image_id, role="assistant", content=extract_text(analysis)
    )

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

    history_repo.clear(image_id)

    with contextlib.suppress(OSError):
        Path(record.file_path).unlink(missing_ok=True)

    image_repo.delete(image_id)
