from io import BytesIO

PNG_HEADER = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100


def _upload(client, app, tmp_path, name: str) -> str:
    app.config["UPLOAD_FOLDER"] = str(tmp_path)
    res = client.post(
        "/upload",
        data={"file": (BytesIO(PNG_HEADER), name)},
        content_type="multipart/form-data",
    )
    return res.get_json()["image_id"]


# -----------------------
# /images pagination
# -----------------------


def test_images_default_limit_returns_all_when_under_default(client, app, tmp_path):
    for i in range(3):
        _upload(client, app, tmp_path, f"pic{i}.png")

    res = client.get("/images")
    body = res.get_json()
    assert res.status_code == 200
    assert len(body["images"]) == 3
    assert body["pagination"] == {"total": 3, "limit": 50, "offset": 0}


def test_images_explicit_limit_and_offset(client, app, tmp_path):
    for i in range(5):
        _upload(client, app, tmp_path, f"pic{i}.png")

    res = client.get("/images?limit=2&offset=2")
    body = res.get_json()
    assert res.status_code == 200
    assert len(body["images"]) == 2
    assert body["pagination"] == {"total": 5, "limit": 2, "offset": 2}


def test_images_rejects_limit_above_cap(client, app, tmp_path):
    res = client.get("/images?limit=1000")
    assert res.status_code == 400
    assert res.get_json()["error"]["code"] == "invalid_pagination"


def test_images_rejects_non_integer_limit(client):
    res = client.get("/images?limit=abc")
    assert res.status_code == 400
    assert res.get_json()["error"]["code"] == "invalid_pagination"


def test_images_rejects_negative_offset(client):
    res = client.get("/images?offset=-1")
    assert res.status_code == 400
    assert res.get_json()["error"]["code"] == "invalid_pagination"


