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
    events: list = []
    for line in text.split("\n"):
        line = line.rstrip()
        if not line.startswith("data: "):
            continue
        data = line[len("data: "):]
        if data == "[DONE]":
            events.append("[DONE]")
        else:
            events.append(json.loads(data))
    return events


def test_stream_returns_text_event_stream(client, app, tmp_path):
    image_id = _upload_image(client, app, tmp_path)
    response = client.post(f"/chat-stream/{image_id}", json={"prompt": "hi"})

    assert response.status_code == 200
    assert response.mimetype == "text/event-stream"
    assert response.headers["Cache-Control"] == "no-cache, no-transform"
    assert response.headers["X-Accel-Buffering"] == "no"


def test_stream_emits_openai_chunk_shape(client, app, tmp_path):
    image_id = _upload_image(client, app, tmp_path)
    response = client.post(f"/chat-stream/{image_id}", json={"prompt": "hi"})
    events = _parse_sse(response.get_data(as_text=True))

    first = events[0]
    assert isinstance(first, dict)
    assert first["object"] == "chat.completion.chunk"
    assert first["choices"][0]["delta"] == {"role": "assistant"}

    assert events[-1] == "[DONE]"

    terminal = events[-2]
    assert isinstance(terminal, dict)
    assert terminal["choices"][0]["finish_reason"] == "stop"


def test_stream_concatenated_content_echoes_prompt(client, app, tmp_path):
    image_id = _upload_image(client, app, tmp_path)
    response = client.post(f"/chat-stream/{image_id}", json={"prompt": "hello"})
    events = _parse_sse(response.get_data(as_text=True))

    text = "".join(
        e["choices"][0]["delta"].get("content", "")
        for e in events
        if isinstance(e, dict)
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
