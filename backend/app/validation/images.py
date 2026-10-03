from dataclasses import dataclass

from werkzeug.datastructures import FileStorage

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

_MAGIC_BYTES: list[tuple[bytes, str, set[str]]] = [
    (b"\x89PNG\r\n\x1a\n", "image/png", {"png"}),
    (b"\xff\xd8\xff", "image/jpeg", {"jpg", "jpeg"}),
    (b"GIF87a", "image/gif", {"gif"}),
    (b"GIF89a", "image/gif", {"gif"}),
]


@dataclass
class ImageValidationError(Exception):
    message: str
    code: str
    status: int = 400


def validate_image(file: FileStorage | None) -> str:
    if file is None or not file.filename:
        raise ImageValidationError(
            message="no file field found in request",
            code="no_file",
            status=400,
        )

    ext = _extension(file.filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise ImageValidationError(
            message=(
                f"file extension '.{ext}' not allowed. "
                f"allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            ),
            code="unsupported_file_type",
            status=415,
        )

    head = file.stream.read(8)
    file.stream.seek(0)

    sniffed = _sniff(head)
    if sniffed is None:
        raise ImageValidationError(
            message="file content does not match a supported image type",
            code="unsupported_file_type",
            status=415,
        )

    mime, valid_extensions = sniffed
    if ext not in valid_extensions:
        raise ImageValidationError(
            message=f"file extension '.{ext}' does not match content type '{mime}'",
            code="mime_extension_mismatch",
            status=415,
        )

    return mime


def _extension(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def _sniff(head: bytes) -> tuple[str, set[str]] | None:
    for magic, mime, extensions in _MAGIC_BYTES:
        if head.startswith(magic):
            return mime, extensions
    return None
