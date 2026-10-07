from datetime import UTC, datetime, timedelta

from sqlalchemy import delete, select

from app.extensions import db
from app.models import ChatMessageModel
from app.repositories.history_repo import ChatMessage


class DbHistoryRepository:
    def add_message(
        self, image_id: str, role: str, content: str, partial: bool = False
    ) -> None:
        msg = ChatMessageModel(
            image_id=image_id,
            role=role,
            content=content,
            partial=partial,
            created_at=datetime.now(UTC),
        )
        db.session.add(msg)
        db.session.commit()

    def get_history(self, image_id: str) -> list[ChatMessage]:
        stmt = (
            select(ChatMessageModel)
            .where(ChatMessageModel.image_id == image_id)
            .order_by(ChatMessageModel.created_at.asc())
        )
        rows = db.session.scalars(stmt).all()
        return [self._to_message(r) for r in rows]

    def clear(self, image_id: str) -> None:
        db.session.execute(
            delete(ChatMessageModel).where(ChatMessageModel.image_id == image_id)
        )
        db.session.commit()

    def delete_older_than(self, days: int) -> int:
        cutoff = datetime.now(UTC) - timedelta(days=days)
        result = db.session.execute(
            delete(ChatMessageModel).where(ChatMessageModel.created_at < cutoff)
        )
        db.session.commit()
        return result.rowcount or 0  # type: ignore[attr-defined]

    @staticmethod
    def _to_message(model: ChatMessageModel) -> ChatMessage:
        created_at = model.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=UTC)
        return ChatMessage(
            role=model.role,
            content=model.content,
            created_at=created_at,
            partial=model.partial,
        )
