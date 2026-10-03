import secrets
import time
from pathlib import Path


def mock_openai_vision_analysis(image_path: str) -> dict:
    time.sleep(0.1)
    name = Path(image_path).name
    content = (
        f"The uploaded image '{name}' appears to contain a scene with "
        "various elements. I can see shapes, colors, and textures that "
        "suggest this is a typical photograph. For an accurate analysis, "
        "please connect a real vision model."
    )
    return {
        "id": f"chatcmpl-{secrets.token_urlsafe(8)}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": "mock-gpt-4o",
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": content},
                "finish_reason": "stop",
            }
        ],
        "usage": {
            "prompt_tokens": 42,
            "completion_tokens": 68,
            "total_tokens": 110,
        },
    }
