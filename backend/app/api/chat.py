from flask import Blueprint, jsonify, request

from app.services.chat_service import answer_chat
from app.validation.chat import validate_chat_prompt

chat_bp = Blueprint("chat", __name__)


@chat_bp.post("/chat/<image_id>")
def chat(image_id: str):
    prompt = validate_chat_prompt(request.get_json(silent=True))
    response = answer_chat(image_id, prompt)
    return jsonify(response), 200
