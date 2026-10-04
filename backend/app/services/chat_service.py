from collections.abc import Iterator

from app.mocks.openai_chat import mock_openai_chat, mock_openai_chat_stream
from app.repositories.image_repo import ImageNotFoundError, image_repo


def answer_chat(image_id: str, prompt: str) -> dict:
    if not image_repo.exists(image_id):
        raise ImageNotFoundError(image_id)
    return mock_openai_chat(prompt, image_id)


def stream_chat(image_id: str, prompt: str) -> Iterator[dict]:
    if not image_repo.exists(image_id):
        raise ImageNotFoundError(image_id)
    return mock_openai_chat_stream(prompt, image_id)
