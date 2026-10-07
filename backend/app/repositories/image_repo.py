from dataclasses import dataclass
from datetime import datetime
from typing import Protocol


class ImageNotFoundError(Exception):
    def __init__(self, image_id: str):
        self.image_id = image_id
        super().__init__(f"image {image_id} not found")


@dataclass(frozen=True)
class ImageRecord:
    id: str
    filename: str
    size_bytes: int
    mime_type: str
    uploaded_at: datetime
    file_path: str


class ImageRepository(Protocol):
    def save(self, record: ImageRecord) -> None: ...

    def get(self, image_id: str) -> ImageRecord | None: ...

    def exists(self, image_id: str) -> bool: ...

    def list_all(self) -> list[ImageRecord]: ...

    def list_page(self, limit: int, offset: int) -> list[ImageRecord]: ...

    def count(self) -> int: ...

    def delete(self, image_id: str) -> None: ...
