from dataclasses import dataclass

MAX_PROMPT_LENGTH = 4000


@dataclass
class ChatValidationError(Exception):
    message: str
    code: str
    status: int = 400


def validate_chat_prompt(body: dict | None) -> str:
    if not body or "prompt" not in body:
        raise ChatValidationError(
            message="request body must include a 'prompt' field",
            code="missing_prompt",
            status=400,
        )

    prompt = body["prompt"]
    if not isinstance(prompt, str) or not prompt.strip():
        raise ChatValidationError(
            message="prompt must be a non-empty string",
            code="invalid_prompt",
            status=400,
        )

    if len(prompt) > MAX_PROMPT_LENGTH:
        raise ChatValidationError(
            message=f"prompt exceeds max length of {MAX_PROMPT_LENGTH} characters",
            code="prompt_too_long",
            status=400,
        )

    return prompt.strip()
