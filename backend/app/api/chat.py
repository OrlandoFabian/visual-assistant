from flask import Blueprint, Response, current_app, jsonify, request, stream_with_context

from app.repositories import ImageNotFoundError, history_repo, image_repo
from app.services.chat_service import answer_chat, save_assistant_message, stream_chat
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
        buffered: list[str] = []
        completed = False
        try:
            for chunk in stream:
                content = chunk["choices"][0].get("delta", {}).get("content", "")
                if content:
                    buffered.append(content)
                yield format_sse_chunk(chunk)
            yield SSE_DONE
            completed = True
        except Exception:
            current_app.logger.exception("stream failed mid-flight")
            yield format_sse_error("stream failed")
        finally:
            text = "".join(buffered)
            if text:
                save_assistant_message(image_id, text, partial=not completed)

    return Response(
        stream_with_context(generate()),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@chat_bp.get("/chat/<image_id>/history")
def chat_history(image_id: str):
    if not image_repo.exists(image_id):
        raise ImageNotFoundError(image_id)

    messages = history_repo.get_history(image_id)
    return jsonify(
        {
            "image_id": image_id,
            "messages": [
                {
                    "role": m.role,
                    "content": m.content,
                    "created_at": m.created_at.isoformat(),
                    "partial": m.partial,
                }
                for m in messages
            ],
        }
    ), 200
