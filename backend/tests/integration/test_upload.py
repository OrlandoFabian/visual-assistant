from io import BytesIO

PNG_HEADER = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100


def test_upload_returns_201_with_image_id_and_analysis(client, tmp_path, app):
    app.config["UPLOAD_FOLDER"] = str(tmp_path)

    response = client.post(
        "/upload",
        data={"file": (BytesIO(PNG_HEADER), "sunset.png")},
        content_type="multipart/form-data",
    )

    assert response.status_code == 201
    body = response.get_json()
    assert body["image_id"].startswith("img_")
    assert body["filename"] == "sunset.png"
    assert body["size_bytes"] > 0
    assert "uploaded_at" in body
    assert body["analysis"]["object"] == "chat.completion"
    assert body["analysis"]["choices"][0]["message"]["role"] == "assistant"


def test_upload_rejects_missing_file(client):
    response = client.post("/upload", data={}, content_type="multipart/form-data")
    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "no_file"


def test_upload_rejects_wrong_extension(client, tmp_path, app):
    app.config["UPLOAD_FOLDER"] = str(tmp_path)
    response = client.post(
        "/upload",
        data={"file": (BytesIO(b"anything"), "doc.pdf")},
        content_type="multipart/form-data",
    )
    assert response.status_code == 415
    assert response.get_json()["error"]["code"] == "unsupported_file_type"


def test_upload_rejects_renamed_executable(client, tmp_path, app):
    app.config["UPLOAD_FOLDER"] = str(tmp_path)
    response = client.post(
        "/upload",
        data={"file": (BytesIO(b"MZ\x90\x00" + b"\x00" * 100), "evil.png")},
        content_type="multipart/form-data",
    )
    assert response.status_code == 415
    assert response.get_json()["error"]["code"] == "unsupported_file_type"
