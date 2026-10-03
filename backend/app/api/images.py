from flask import Blueprint, current_app, jsonify, request

from app.services.image_service import upload_image

images_bp = Blueprint("images", __name__)


@images_bp.post("/upload")
def upload():
    file = request.files.get("file")
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    payload = upload_image(file, upload_folder)
    return jsonify(payload), 201
