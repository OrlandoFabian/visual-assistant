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


def test_history_is_empty_for_fresh_image(client, app, tmp_path):
    image_id = _upload_image(client, app, tmp_path)
    response = client.get(f"/chat/{image_id}/history")

    assert response.status_code == 200
    body = response.get_json()
    assert body["image_id"] == image_id
    assert body["messages"] == []


def test_history_captures_user_and_assistant_messages(client, app, tmp_path):
    image_id = _upload_image(client, app, tmp_path)
    client.post(f"/chat/{image_id}", json={"prompt": "what is this?"})

    response = client.get(f"/chat/{image_id}/history")
    body = response.get_json()

    roles = [m["role"] for m in body["messages"]]
    assert roles == ["user", "assistant"]
    assert body["messages"][0]["content"] == "what is this?"
    assert body["messages"][1]["content"]
    assert body["messages"][1]["partial"] is False


def test_second_chat_references_prior_turn(client, app, tmp_path):
    image_id = _upload_image(client, app, tmp_path)
    client.post(f"/chat/{image_id}", json={"prompt": "first question"})
    response = client.post(f"/chat/{image_id}", json={"prompt": "second question"})

    body = response.get_json()
    content = body["choices"][0]["message"]["content"]
    assert "[Turn 2]" in content


def test_streaming_saves_assistant_message_to_history(client, app, tmp_path):
    image_id = _upload_image(client, app, tmp_path)
    client.post(f"/chat-stream/{image_id}", json={"prompt": "stream this"})

    response = client.get(f"/chat/{image_id}/history")
    messages = response.get_json()["messages"]

    assert [m["role"] for m in messages] == ["user", "assistant"]
    assert messages[0]["content"] == "stream this"
    assert messages[1]["partial"] is False
    assert len(messages[1]["content"]) > 0


def test_history_returns_404_for_unknown_image(client):
    response = client.get("/chat/img_nothing/history")
    assert response.status_code == 404
    assert response.get_json()["error"]["code"] == "image_not_found"


def test_multiple_chats_accumulate(client, app, tmp_path):
    image_id = _upload_image(client, app, tmp_path)
    for i in range(3):
        client.post(f"/chat/{image_id}", json={"prompt": f"q{i}"})

    response = client.get(f"/chat/{image_id}/history")
    messages = response.get_json()["messages"]

    assert len(messages) == 6  # 3 user + 3 assistant
    assert [m["role"] for m in messages] == [
        "user", "assistant", "user", "assistant", "user", "assistant",
    ]
