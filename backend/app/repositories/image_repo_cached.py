from app.cache import LRUCache
from app.repositories.image_repo import ImageRecord
from app.repositories.image_repo_db import DbImageRepository


class CachedImageRepository:
    def __init__(self, backing: DbImageRepository, max_size: int = 128) -> None:
        self._backing = backing
        self._cache: LRUCache[ImageRecord] = LRUCache(max_size=max_size)

    def save(self, record: ImageRecord) -> None:
        self._backing.save(record)
        self._cache.put(record.id, record)

    def get(self, image_id: str) -> ImageRecord | None:
        cached = self._cache.get(image_id)
        if cached is not None:
            return cached
        record = self._backing.get(image_id)
        if record is not None:
            self._cache.put(image_id, record)
        return record

    def exists(self, image_id: str) -> bool:
        return self.get(image_id) is not None

    def clear_all(self) -> None:
        self._backing.clear_all()
        self._cache.clear()

    def list_all(self) -> list[ImageRecord]:
        # The list changes on every upload and would be stale instantly;
        # pass through to the backing store rather than cache it.
        return self._backing.list_all()

    def delete(self, image_id: str) -> None:
        self._backing.delete(image_id)
        self._cache.invalidate(image_id)

    @property
    def cache_stats(self) -> dict:
        return {
            "hits": self._cache.hits,
            "misses": self._cache.misses,
            "size": len(self._cache),
        }
