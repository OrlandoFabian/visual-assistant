from datetime import UTC, datetime

from app.cache import LRUCache
from app.repositories.image_repo import ImageRecord


def _record(id: str = "img_1") -> ImageRecord:
    return ImageRecord(
        id=id,
        filename="x.png",
        size_bytes=1,
        mime_type="image/png",
        uploaded_at=datetime.now(UTC),
        file_path="/tmp/x.png",
    )


def test_returns_none_on_miss():
    cache: LRUCache[ImageRecord] = LRUCache()
    assert cache.get("missing") is None
    assert cache.misses == 1


def test_round_trip():
    cache: LRUCache[ImageRecord] = LRUCache()
    r = _record()
    cache.put("img_1", r)
    assert cache.get("img_1") is r
    assert cache.hits == 1


def test_evicts_oldest_when_full():
    cache: LRUCache[ImageRecord] = LRUCache(max_size=2)
    cache.put("a", _record("a"))
    cache.put("b", _record("b"))
    cache.put("c", _record("c"))
    assert cache.get("a") is None
    assert cache.get("b") is not None
    assert cache.get("c") is not None


def test_lru_order_based_on_access():
    cache: LRUCache[ImageRecord] = LRUCache(max_size=2)
    cache.put("a", _record("a"))
    cache.put("b", _record("b"))
    cache.get("a")
    cache.put("c", _record("c"))
    assert cache.get("a") is not None
    assert cache.get("b") is None
    assert cache.get("c") is not None


def test_invalidate_removes_entry():
    cache: LRUCache[ImageRecord] = LRUCache()
    cache.put("img_1", _record())
    cache.invalidate("img_1")
    assert cache.get("img_1") is None


def test_clear_wipes_everything():
    cache: LRUCache[ImageRecord] = LRUCache()
    cache.put("a", _record("a"))
    cache.put("b", _record("b"))
    cache.clear()
    assert cache.get("a") is None
    assert cache.get("b") is None
    assert cache.hits == 0
    assert cache.misses == 2


def test_put_overwrites_existing():
    cache: LRUCache[ImageRecord] = LRUCache()
    r1 = _record()
    r2 = _record()
    cache.put("img_1", r1)
    cache.put("img_1", r2)
    assert cache.get("img_1") is r2
    assert len(cache) == 1
