from flask import Blueprint, Response, current_app, jsonify, request, stream_with_context

from app.services.chat_service import answer_chat, stream_chat
from app.utils.sse import SSE_DONE, format_sse_chunk, format_sse_error, format_sse_retry
from app.validation.chat import validate_chat_prompt

chat_bp = Blueprint("chat", __name__)


@chat_bp.post("/chat/<image_id>")
def chat(image_id: str):
    prompt = validate_chat_prompt(request.get_json(silent=True))
    response = answer_chat(image_id, prompt)
    return jsonify(response), 200


@chat_bp.post("/chat-stream/<image_id>")
def chat_stream(image_id: str):
    prompt = validate_chat_prompt(request.get_json(silent=True))
    stream = stream_chat(image_id, prompt)

    def generate():
        yield format_sse_retry(3000)
        try:
            for chunk in stream:
                yield format_sse_chunk(chunk)
            yield SSE_DONE
        except Exception:
            current_app.logger.exception("stream failed mid-flight")
            yield format_sse_error("stream failed")

    return Response(
        stream_with_context(generate()),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
