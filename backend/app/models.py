from datetime import UTC, datetime

from app.extensions import db


class ImageModel(db.Model):
    __tablename__ = "images"

    id = db.Column(db.String, primary_key=True)
    filename = db.Column(db.String, nullable=False)
    size_bytes = db.Column(db.Integer, nullable=False)
    mime_type = db.Column(db.String, nullable=False)
    uploaded_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
    )
    file_path = db.Column(db.String, nullable=False)

    messages = db.relationship(
        "ChatMessageModel",
        back_populates="image",
        cascade="all, delete-orphan",
    )


class ChatMessageModel(db.Model):
    __tablename__ = "chat_messages"

    id = db.Column(db.Integer, primary_key=True)
    image_id = db.Column(
        db.String,
        db.ForeignKey("images.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role = db.Column(db.String, nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
        index=True,
    )
    partial = db.Column(db.Boolean, nullable=False, default=False)

    image = db.relationship("ImageModel", back_populates="messages")
