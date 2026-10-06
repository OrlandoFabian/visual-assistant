"""Rate-limiting integration tests.

The default test fixture disables the limiter (so other tests can hammer
the API without tripping limits). These tests re-enable it, reset
counters, and prove the limit kicks in and returns a consistent 429.
"""

from io import BytesIO

import pytest

from app.extensions import limiter

PNG_HEADER = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100


@pytest.fixture()
def limited_app(app):
    limiter.enabled = True
    limiter.reset()
    yield app
    limiter.enabled = False
    limiter.reset()


def _upload_image(client, tmp_path, app):
    app.config["UPLOAD_FOLDER"] = str(tmp_path)
    return client.post(
        "/upload",
        data={"file": (BytesIO(PNG_HEADER), "pic.png")},
        content_type="multipart/form-data",
    )


def test_upload_rate_limit_returns_429_after_threshold(limited_app, client, tmp_path):
    # /upload is limited to 10/minute. 10 should succeed; the 11th gets 429.
    for i in range(10):
        res = _upload_image(client, tmp_path, limited_app)
        assert res.status_code == 201, f"request {i + 1} unexpectedly failed"

    res = _upload_image(client, tmp_path, limited_app)
    assert res.status_code == 429
    body = res.get_json()
    assert body["error"]["code"] == "rate_limit_exceeded"
    assert body["error"]["type"] == "invalid_request_error"


def test_chat_rate_limit_envelope_is_consistent(limited_app, client, tmp_path):
    # Seed an image so /chat has a valid target.
    upload = _upload_image(client, tmp_path, limited_app)
    image_id = upload.get_json()["image_id"]

    # /chat is limited to 60/minute. Burn through the budget then confirm 429.
    for i in range(60):
        res = client.post(f"/chat/{image_id}", json={"prompt": f"q{i}"})
        assert res.status_code == 200

    res = client.post(f"/chat/{image_id}", json={"prompt": "overflow"})
    assert res.status_code == 429
    body = res.get_json()
    assert body["error"]["code"] == "rate_limit_exceeded"
    assert "rate limit exceeded" in body["error"]["message"].lower()


