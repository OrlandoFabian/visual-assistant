from app.repositories.history_repo import ChatMessage, HistoryRepository
from app.repositories.history_repo_db import DbHistoryRepository
from app.repositories.image_repo import ImageNotFoundError, ImageRecord
from app.repositories.image_repo_cached import CachedImageRepository
from app.repositories.image_repo_db import DbImageRepository

image_repo = CachedImageRepository(DbImageRepository())
history_repo: HistoryRepository = DbHistoryRepository()

__all__ = [
    "image_repo",
    "history_repo",
    "ImageNotFoundError",
    "ImageRecord",
    "ChatMessage",
    "HistoryRepository",
]
