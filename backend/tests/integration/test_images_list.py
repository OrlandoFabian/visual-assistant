from io import BytesIO

PNG_HEADER = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100


def _upload(client, app, tmp_path, filename: str = "pic.png") -> str:
    app.config["UPLOAD_FOLDER"] = str(tmp_path)
    response = client.post(
        "/upload",
        data={"file": (BytesIO(PNG_HEADER), filename)},
        content_type="multipart/form-data",
    )
    return response.get_json()["image_id"]


def test_list_images_empty(client):
    response = client.get("/images")
    assert response.status_code == 200
    assert response.get_json() == {"images": []}


def test_list_images_returns_uploaded(client, app, tmp_path):
    image_id = _upload(client, app, tmp_path, "sunset.png")

    response = client.get("/images")
    body = response.get_json()

    assert len(body["images"]) == 1
    entry = body["images"][0]
    assert entry["image_id"] == image_id
    assert entry["filename"] == "sunset.png"
    assert entry["mime_type"] == "image/png"
    assert entry["size_bytes"] > 0
    assert "uploaded_at" in entry


def test_list_images_sorted_newest_first(client, app, tmp_path):
    first = _upload(client, app, tmp_path, "a.png")
    second = _upload(client, app, tmp_path, "b.png")
    third = _upload(client, app, tmp_path, "c.png")

    response = client.get("/images")
    ids = [img["image_id"] for img in response.get_json()["images"]]

    assert ids == [third, second, first]


def test_preview_returns_image_bytes(client, app, tmp_path):
    image_id = _upload(client, app, tmp_path)

    response = client.get(f"/images/{image_id}/preview")

    assert response.status_code == 200
    assert response.mimetype == "image/png"
    assert response.data.startswith(b"\x89PNG")


def test_preview_404_for_unknown_image(client):
    response = client.get("/images/img_nothing/preview")

    assert response.status_code == 404
    assert response.get_json()["error"]["code"] == "image_not_found"


def test_delete_image_returns_204_and_removes_from_list(client, app, tmp_path):
    image_id = _upload(client, app, tmp_path)

    response = client.delete(f"/images/{image_id}")
    assert response.status_code == 204

    list_response = client.get("/images")
    assert list_response.get_json() == {"images": []}


def test_delete_image_removes_file_from_disk(client, app, tmp_path):
    _upload(client, app, tmp_path)
    assert len(list(tmp_path.iterdir())) == 1

    list_response = client.get("/images")
    image_id = list_response.get_json()["images"][0]["image_id"]

    client.delete(f"/images/{image_id}")

    assert list(tmp_path.iterdir()) == []


def test_delete_image_also_removes_chat_history(client, app, tmp_path):
    image_id = _upload(client, app, tmp_path)
    client.post(f"/chat/{image_id}", json={"prompt": "hello"})

    # 1 initial analysis (on upload) + user + assistant
    before = client.get(f"/chat/{image_id}/history").get_json()
    assert len(before["messages"]) == 3

    client.delete(f"/images/{image_id}")

    after = client.get(f"/chat/{image_id}/history")
    assert after.status_code == 404


def test_delete_unknown_image_returns_404(client):
    response = client.delete("/images/img_nothing")
    assert response.status_code == 404
    assert response.get_json()["error"]["code"] == "image_not_found"
