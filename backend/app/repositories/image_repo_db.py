from datetime import UTC

from app.extensions import db
from app.models import ImageModel
from app.repositories.image_repo import ImageRecord


class DbImageRepository:
    def save(self, record: ImageRecord) -> None:
        model = ImageModel(
            id=record.id,
            filename=record.filename,
            size_bytes=record.size_bytes,
            mime_type=record.mime_type,
            uploaded_at=record.uploaded_at,
            file_path=record.file_path,
        )
        db.session.add(model)
        db.session.commit()

    def get(self, image_id: str) -> ImageRecord | None:
        model = db.session.get(ImageModel, image_id)
        if model is None:
            return None
        return self._to_record(model)

    def exists(self, image_id: str) -> bool:
        return db.session.get(ImageModel, image_id) is not None

    def clear_all(self) -> None:
        db.session.query(ImageModel).delete()
        db.session.commit()

    @staticmethod
    def _to_record(model: ImageModel) -> ImageRecord:
        uploaded_at = model.uploaded_at
        if uploaded_at.tzinfo is None:
            uploaded_at = uploaded_at.replace(tzinfo=UTC)
        return ImageRecord(
            id=model.id,
            filename=model.filename,
            size_bytes=model.size_bytes,
            mime_type=model.mime_type,
            uploaded_at=uploaded_at,
            file_path=model.file_path,
        )
