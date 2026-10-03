from dataclasses import dataclass
from datetime import datetime
from threading import Lock


@dataclass(frozen=True)
class ImageRecord:
    id: str
    filename: str
    size_bytes: int
    mime_type: str
    uploaded_at: datetime
    file_path: str


class ImageRepository:
    def __init__(self) -> None:
        self._store: dict[str, ImageRecord] = {}
        self._lock = Lock()

    def save(self, record: ImageRecord) -> None:
        with self._lock:
            self._store[record.id] = record

    def get(self, image_id: str) -> ImageRecord | None:
        with self._lock:
            return self._store.get(image_id)

    def exists(self, image_id: str) -> bool:
        with self._lock:
            return image_id in self._store


image_repo = ImageRepository()
