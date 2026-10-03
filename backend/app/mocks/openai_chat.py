import secrets
import time


def mock_openai_chat(prompt: str, image_id: str) -> dict:
    time.sleep(0.2)
    reply = _compose_reply(prompt, image_id)
    prompt_tokens = _estimate_tokens(prompt)
    completion_tokens = _estimate_tokens(reply)
    return {
        "id": f"chatcmpl-{secrets.token_urlsafe(8)}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": "mock-gpt-4o",
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": reply},
                "finish_reason": "stop",
            }
        ],
        "usage": {
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
        },
    }


def _compose_reply(prompt: str, image_id: str) -> str:
    return (
        f"Regarding image {image_id}: based on the mock vision analysis, "
        f"here is my response to your question. You asked: '{prompt}'. "
        "A real vision-capable model would answer with actual observations "
        "about the image content."
    )


def _estimate_tokens(text: str) -> int:
    return max(1, len(text) // 4)
