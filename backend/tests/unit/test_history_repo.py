from datetime import UTC, datetime, timedelta

from app.repositories.history_repo import ChatMessage, InMemoryHistoryRepository


def test_add_and_get_round_trip():
    repo = InMemoryHistoryRepository()
    repo.add_message("img_1", "user", "hi")
    repo.add_message("img_1", "assistant", "hello back")

    history = repo.get_history("img_1")
    assert [m.content for m in history] == ["hi", "hello back"]
    assert [m.role for m in history] == ["user", "assistant"]


def test_preserves_order():
    repo = InMemoryHistoryRepository()
    for i in range(5):
        repo.add_message("img_1", "user", f"msg {i}")
    history = repo.get_history("img_1")
    assert [m.content for m in history] == [f"msg {i}" for i in range(5)]


def test_isolates_different_images():
    repo = InMemoryHistoryRepository()
    repo.add_message("img_1", "user", "one")
    repo.add_message("img_2", "user", "two")
    assert len(repo.get_history("img_1")) == 1
    assert len(repo.get_history("img_2")) == 1
    assert repo.get_history("img_1")[0].content == "one"


def test_empty_for_unknown_image():
    repo = InMemoryHistoryRepository()
    assert repo.get_history("img_nothing") == []


def test_partial_flag_persisted():
    repo = InMemoryHistoryRepository()
    repo.add_message("img_1", "assistant", "incomplete", partial=True)
    history = repo.get_history("img_1")
    assert history[0].partial is True


def test_clear_removes_image_history():
    repo = InMemoryHistoryRepository()
    repo.add_message("img_1", "user", "hi")
    repo.clear("img_1")
    assert repo.get_history("img_1") == []


def test_clear_all_wipes_everything():
    repo = InMemoryHistoryRepository()
    repo.add_message("img_1", "user", "hi")
    repo.add_message("img_2", "user", "hi")
    repo.clear_all()
    assert repo.get_history("img_1") == []
    assert repo.get_history("img_2") == []


def test_delete_older_than_removes_old_messages():
    repo = InMemoryHistoryRepository()
    stale = ChatMessage(
        role="user",
        content="old",
        created_at=datetime.now(UTC) - timedelta(days=40),
    )
    repo._data["img_1"].append(stale)
    repo.add_message("img_1", "user", "new")

    removed = repo.delete_older_than(days=30)

    assert removed == 1
    history = repo.get_history("img_1")
    assert len(history) == 1
    assert history[0].content == "new"
