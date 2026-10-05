from collections import defaultdict
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from threading import Lock
from typing import Protocol


@dataclass(frozen=True)
class ChatMessage:
    role: str  # "user" or "assistant"
    content: str
    created_at: datetime
    partial: bool = False


class HistoryRepository(Protocol):
    def add_message(
        self, image_id: str, role: str, content: str, partial: bool = False
    ) -> None: ...

    def get_history(self, image_id: str) -> list[ChatMessage]: ...

    def clear(self, image_id: str) -> None: ...

    def clear_all(self) -> None: ...

    def delete_older_than(self, days: int) -> int: ...


class InMemoryHistoryRepository:
    def __init__(self) -> None:
        self._data: dict[str, list[ChatMessage]] = defaultdict(list)
        self._lock = Lock()

    def add_message(
        self, image_id: str, role: str, content: str, partial: bool = False
    ) -> None:
        with self._lock:
            self._data[image_id].append(
                ChatMessage(
                    role=role,
                    content=content,
                    created_at=datetime.now(UTC),
                    partial=partial,
                )
            )

    def get_history(self, image_id: str) -> list[ChatMessage]:
        with self._lock:
            return list(self._data[image_id])

    def clear(self, image_id: str) -> None:
        with self._lock:
            self._data.pop(image_id, None)

    def clear_all(self) -> None:
        with self._lock:
            self._data.clear()

    def delete_older_than(self, days: int) -> int:
        cutoff = datetime.now(UTC) - timedelta(days=days)
        removed = 0
        with self._lock:
            for image_id in list(self._data.keys()):
                kept = [m for m in self._data[image_id] if m.created_at >= cutoff]
                removed += len(self._data[image_id]) - len(kept)
                if kept:
                    self._data[image_id] = kept
                else:
                    del self._data[image_id]
        return removed


