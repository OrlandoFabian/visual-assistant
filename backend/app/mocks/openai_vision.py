import secrets
import time
from pathlib import Path

from app.mocks.responses import build_response


def mock_openai_vision_analysis(image_path: str) -> dict:
    time.sleep(0.1)
    name = Path(image_path).name
    text = (
        f"The uploaded image '{name}' appears to contain a scene with "
        "various elements. I can see shapes, colors, and textures that "
        "suggest this is a typical photograph. For an accurate analysis, "
        "please connect a real vision model."
    )
    return build_response(
        response_id=f"resp_{secrets.token_urlsafe(8)}",
        message_id=f"msg_{secrets.token_urlsafe(8)}",
        text=text,
        input_tokens=42,
        output_tokens=68,
    )
