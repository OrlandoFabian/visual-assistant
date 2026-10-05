from datetime import UTC, datetime

from app.repositories.image_repo import ImageRecord
from app.repositories.image_repo_cached import CachedImageRepository
from app.repositories.image_repo_db import DbImageRepository


def _record(id: str = "img_1") -> ImageRecord:
    return ImageRecord(
        id=id,
        filename="x.png",
        size_bytes=1,
        mime_type="image/png",
        uploaded_at=datetime.now(UTC),
        file_path="/tmp/x.png",
    )


def test_save_then_get_is_a_cache_hit(app):
    with app.app_context():
        repo = CachedImageRepository(DbImageRepository())
        repo.save(_record("img_a"))

        repo.get("img_a")

        assert repo.cache_stats["hits"] == 1
        assert repo.cache_stats["misses"] == 0


def test_cold_get_misses_then_warm_get_hits(app):
    with app.app_context():
        db_repo = DbImageRepository()
        db_repo.save(_record("img_b"))

        cached = CachedImageRepository(db_repo)
        cached.get("img_b")
        cached.get("img_b")

        assert cached.cache_stats["misses"] == 1
        assert cached.cache_stats["hits"] == 1


def test_clear_all_resets_the_cache(app):
    with app.app_context():
        repo = CachedImageRepository(DbImageRepository())
        repo.save(_record("img_c"))
        repo.get("img_c")

        repo.clear_all()

        assert repo.cache_stats["size"] == 0
        assert repo.cache_stats["hits"] == 0
        assert repo.cache_stats["misses"] == 0
