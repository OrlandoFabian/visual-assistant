from dataclasses import dataclass
from datetime import datetime
from typing import Protocol


@dataclass(frozen=True)
class ChatMessage:
    role: str
    content: str
    created_at: datetime
    partial: bool = False


class HistoryRepository(Protocol):
    def add_message(
        self, image_id: str, role: str, content: str, partial: bool = False
    ) -> None: ...

    def get_history(self, image_id: str) -> list[ChatMessage]: ...

    def clear(self, image_id: str) -> None: ...

    def delete_older_than(self, days: int) -> int: ...
