import json
from io import BytesIO

PNG_HEADER = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100


def _upload_image(client, app, tmp_path) -> str:
    app.config["UPLOAD_FOLDER"] = str(tmp_path)
    response = client.post(
        "/upload",
        data={"file": (BytesIO(PNG_HEADER), "pic.png")},
        content_type="multipart/form-data",
    )
    return response.get_json()["image_id"]


def _parse_sse(text: str) -> list:
    """Parse SSE named-event stream into a list of (event, payload) tuples.

    Returns the literal string "[DONE]" for the sentinel line.
    """
    events: list = []
    current_event: str | None = None
    for line in text.split("\n"):
        line = line.rstrip()
        if line.startswith("event: "):
            current_event = line[len("event: "):]
            continue
        if line.startswith("data: "):
            data = line[len("data: "):]
            if data == "[DONE]":
                events.append("[DONE]")
            else:
                events.append((current_event, json.loads(data)))
            current_event = None
    return events


def test_stream_returns_text_event_stream(client, app, tmp_path):
    image_id = _upload_image(client, app, tmp_path)
    response = client.post(f"/chat-stream/{image_id}", json={"prompt": "hi"})

    assert response.status_code == 200
    assert response.mimetype == "text/event-stream"
    assert response.headers["Cache-Control"] == "no-cache, no-transform"
    assert response.headers["X-Accel-Buffering"] == "no"


def test_stream_emits_openai_responses_event_shape(client, app, tmp_path):
    image_id = _upload_image(client, app, tmp_path)
    response = client.post(f"/chat-stream/{image_id}", json={"prompt": "hi"})
    events = _parse_sse(response.get_data(as_text=True))

    first_event, first_payload = events[0]
    assert first_event == "response.created"
    assert first_payload["type"] == "response.created"
    assert first_payload["response"]["status"] == "in_progress"

    assert events[-1] == "[DONE]"

    terminal_event, terminal_payload = events[-2]
    assert terminal_event == "response.completed"
    assert terminal_payload["response"]["status"] == "completed"
    assert terminal_payload["response"]["output"][0]["content"][0]["type"] == "output_text"


def test_stream_concatenated_deltas_echo_prompt(client, app, tmp_path):
    image_id = _upload_image(client, app, tmp_path)
    response = client.post(f"/chat-stream/{image_id}", json={"prompt": "hello"})
    events = _parse_sse(response.get_data(as_text=True))

    text = "".join(
        payload.get("delta", "")
        for event, payload in (e for e in events if isinstance(e, tuple))
        if event == "response.output_text.delta"
    )
    assert "hello" in text
    assert len(text) > 0


def test_stream_returns_404_json_for_unknown_image(client):
    response = client.post("/chat-stream/img_nonexistent", json={"prompt": "hi"})
    assert response.status_code == 404
    assert response.mimetype == "application/json"
    assert response.get_json()["error"]["code"] == "image_not_found"


def test_stream_rejects_missing_prompt(client, app, tmp_path):
    image_id = _upload_image(client, app, tmp_path)
    response = client.post(f"/chat-stream/{image_id}", json={})
    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "missing_prompt"
