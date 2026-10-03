from io import BytesIO

import pytest
from werkzeug.datastructures import FileStorage

from app.validation.images import ImageValidationError, validate_image

PNG_HEADER = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
JPEG_HEADER = b"\xff\xd8\xff\xe0" + b"\x00" * 100
GIF_HEADER = b"GIF89a" + b"\x00" * 100


def _file(name: str, body: bytes) -> FileStorage:
    return FileStorage(stream=BytesIO(body), filename=name)


def test_accepts_valid_png():
    assert validate_image(_file("pic.png", PNG_HEADER)) == "image/png"


def test_accepts_valid_jpeg():
    assert validate_image(_file("pic.jpg", JPEG_HEADER)) == "image/jpeg"


def test_accepts_valid_gif():
    assert validate_image(_file("pic.gif", GIF_HEADER)) == "image/gif"


def test_rejects_missing_file():
    with pytest.raises(ImageValidationError) as exc:
        validate_image(None)
    assert exc.value.code == "no_file"


def test_rejects_bad_extension():
    with pytest.raises(ImageValidationError) as exc:
        validate_image(_file("evil.exe", b"MZ" + b"\x00" * 100))
    assert exc.value.status == 415
    assert exc.value.code == "unsupported_file_type"


def test_rejects_mime_extension_mismatch():
    with pytest.raises(ImageValidationError) as exc:
        validate_image(_file("fake.png", JPEG_HEADER))
    assert exc.value.code == "mime_extension_mismatch"


def test_rejects_content_with_valid_extension_but_wrong_bytes():
    with pytest.raises(ImageValidationError) as exc:
        validate_image(_file("real.png", b"this is not actually a png" + b"\x00" * 100))
    assert exc.value.code == "unsupported_file_type"
