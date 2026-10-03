import secrets


def generate_image_id() -> str:
    return f"img_{secrets.token_urlsafe(8)}"
