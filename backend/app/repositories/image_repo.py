from dataclasses import dataclass
from datetime import datetime


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
