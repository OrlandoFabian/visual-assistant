from collections.abc import Iterator

from app.mocks.openai_chat import mock_openai_chat, mock_openai_chat_stream
from app.repositories import ImageNotFoundError, history_repo, image_repo


def answer_chat(image_id: str, prompt: str) -> dict:
    if not image_repo.exists(image_id):
        raise ImageNotFoundError(image_id)

    history = history_repo.get_history(image_id)
    history_repo.add_message(image_id, role="user", content=prompt)

    response = mock_openai_chat(prompt, image_id, history=history)
    assistant_text = response["choices"][0]["message"]["content"]
    history_repo.add_message(image_id, role="assistant", content=assistant_text)

    return response


def stream_chat(image_id: str, prompt: str) -> Iterator[dict]:
    if not image_repo.exists(image_id):
        raise ImageNotFoundError(image_id)

    history = history_repo.get_history(image_id)
    history_repo.add_message(image_id, role="user", content=prompt)

    return mock_openai_chat_stream(prompt, image_id, history=history)


def save_assistant_message(image_id: str, content: str, partial: bool = False) -> None:
    if content:
        history_repo.add_message(
            image_id, role="assistant", content=content, partial=partial
        )
