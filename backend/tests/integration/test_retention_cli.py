from datetime import UTC, datetime, timedelta

from app.extensions import db
from app.models import ChatMessageModel, ImageModel


def _seed_message(image_id: str, days_old: int) -> None:
    msg = ChatMessageModel(
        image_id=image_id,
        role="user",
        content=f"message from {days_old} days ago",
        partial=False,
        created_at=datetime.now(UTC) - timedelta(days=days_old),
    )
    db.session.add(msg)


def _seed_image(image_id: str) -> None:
    img = ImageModel(
        id=image_id,
        filename="test.png",
        size_bytes=100,
        mime_type="image/png",
        uploaded_at=datetime.now(UTC),
        file_path=f"/tmp/{image_id}.png",
    )
    db.session.add(img)


def test_retention_prune_deletes_only_messages_older_than_days(app):
    _seed_image("img_old")
    _seed_image("img_new")
    _seed_message("img_old", days_old=40)
    _seed_message("img_old", days_old=35)
    _seed_message("img_new", days_old=5)
    db.session.commit()

    runner = app.test_cli_runner()
    result = runner.invoke(args=["retention", "prune", "--days", "30"])

    assert result.exit_code == 0
    assert "Removed 2 chat message(s) older than 30 day(s)." in result.output

    remaining = db.session.query(ChatMessageModel).all()
    assert len(remaining) == 1
    assert remaining[0].image_id == "img_new"


def test_retention_prune_rejects_zero_or_negative_days(app):
    runner = app.test_cli_runner()
    result = runner.invoke(args=["retention", "prune", "--days", "0"])
    assert result.exit_code != 0
    assert "must be >= 1" in result.output


def test_retention_prune_with_no_matching_rows_reports_zero(app):
    _seed_image("img_fresh")
    _seed_message("img_fresh", days_old=1)
    db.session.commit()

    runner = app.test_cli_runner()
    result = runner.invoke(args=["retention", "prune", "--days", "30"])

    assert result.exit_code == 0
    assert "Removed 0 chat message(s)" in result.output
