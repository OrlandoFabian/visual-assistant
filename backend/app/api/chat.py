from flask import Blueprint, Response, current_app, jsonify, request, stream_with_context

from app.extensions import limiter
from app.repositories import ImageNotFoundError, history_repo, image_repo
from app.services.chat_service import answer_chat, save_assistant_message, stream_chat
from app.utils.sse import SSE_DONE, format_sse_error, format_sse_event, format_sse_retry
from app.validation.chat import validate_chat_prompt
from app.validation.pagination import parse_pagination

chat_bp = Blueprint("chat", __name__)


@chat_bp.post("/chat/<image_id>")
@limiter.limit("60 per minute")
def chat(image_id: str):
    prompt = validate_chat_prompt(request.get_json(silent=True))
    response = answer_chat(image_id, prompt)
    return jsonify(response), 200


@chat_bp.post("/chat-stream/<image_id>")
@limiter.limit("20 per minute")
def chat_stream(image_id: str):
    prompt = validate_chat_prompt(request.get_json(silent=True))
    stream = stream_chat(image_id, prompt)

    def generate():
        yield format_sse_retry(3000)
        buffered: list[str] = []
        completed = False
        try:
            for event, payload in stream:
                if event == "response.output_text.delta":
                    buffered.append(payload.get("delta", ""))
                yield format_sse_event(event, payload)
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

    page = parse_pagination(request.args)
    messages = history_repo.get_history_page(
        image_id, limit=page.limit, offset=page.offset
    )
    total = history_repo.count_history(image_id)
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
            "pagination": {
                "total": total,
                "limit": page.limit,
                "offset": page.offset,
            },
        }
    ), 200
