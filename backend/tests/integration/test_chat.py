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


def test_chat_returns_openai_shaped_response(client, app, tmp_path):
    image_id = _upload_image(client, app, tmp_path)

    response = client.post(f"/chat/{image_id}", json={"prompt": "What is this?"})

    assert response.status_code == 200
    body = response.get_json()
    assert body["object"] == "response"
    assert body["status"] == "completed"
    message = body["output"][0]
    assert message["type"] == "message"
    assert message["role"] == "assistant"
    assert message["content"][0]["type"] == "output_text"
    assert message["content"][0]["text"]
    assert body["usage"]["total_tokens"] > 0


def test_chat_rejects_missing_prompt(client, app, tmp_path):
    image_id = _upload_image(client, app, tmp_path)
    response = client.post(f"/chat/{image_id}", json={})
    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "missing_prompt"


def test_chat_rejects_empty_prompt(client, app, tmp_path):
    image_id = _upload_image(client, app, tmp_path)
    response = client.post(f"/chat/{image_id}", json={"prompt": "   "})
    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "invalid_prompt"


def test_chat_returns_404_for_unknown_image(client):
    response = client.post("/chat/img_nonexistent", json={"prompt": "hi"})
    assert response.status_code == 404
    assert response.get_json()["error"]["code"] == "image_not_found"
