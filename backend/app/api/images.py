from pathlib import Path

from flask import Blueprint, current_app, jsonify, request, send_file

from app.extensions import limiter
from app.repositories import ImageNotFoundError, image_repo
from app.services.image_service import delete_image, upload_image

images_bp = Blueprint("images", __name__)


@images_bp.post("/upload")
@limiter.limit("10 per minute")
def upload():
    file = request.files.get("file")
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    payload = upload_image(file, upload_folder)
    return jsonify(payload), 201


@images_bp.get("/images")
def list_images():
    records = image_repo.list_all()
    return jsonify(
        {
            "images": [
                {
                    "image_id": r.id,
                    "filename": r.filename,
                    "size_bytes": r.size_bytes,
                    "mime_type": r.mime_type,
                    "uploaded_at": r.uploaded_at.isoformat(),
                }
                for r in records
            ]
        }
    ), 200


@images_bp.get("/images/<image_id>/preview")
def image_preview(image_id: str):
    record = image_repo.get(image_id)
    if record is None:
        raise ImageNotFoundError(image_id)
    if not Path(record.file_path).exists():
        raise ImageNotFoundError(image_id)
    return send_file(record.file_path, mimetype=record.mime_type)


@images_bp.delete("/images/<image_id>")
def delete_image_route(image_id: str):
    delete_image(image_id)
    return "", 204
