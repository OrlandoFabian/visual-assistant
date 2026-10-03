from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException, RequestEntityTooLarge

from app.repositories.image_repo import ImageNotFoundError
from app.validation.chat import ChatValidationError
from app.validation.images import ImageValidationError


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(ImageValidationError)
    def _handle_image_validation(e: ImageValidationError):
        return _error_response(e.message, e.code, e.status)

    @app.errorhandler(ChatValidationError)
    def _handle_chat_validation(e: ChatValidationError):
        return _error_response(e.message, e.code, e.status)

    @app.errorhandler(ImageNotFoundError)
    def _handle_image_not_found(e: ImageNotFoundError):
        return _error_response(
            f"image '{e.image_id}' not found",
            "image_not_found",
            404,
        )

    @app.errorhandler(RequestEntityTooLarge)
    def _handle_too_large(e: RequestEntityTooLarge):
        return _error_response(
            "file exceeds the 16MB upload limit",
            "file_too_large",
            413,
        )

    @app.errorhandler(404)
    def _handle_404(e: HTTPException):
        return _error_response("resource not found", "not_found", 404)

    @app.errorhandler(405)
    def _handle_405(e: HTTPException):
        return _error_response("method not allowed", "method_not_allowed", 405)


def _error_response(message: str, code: str, status: int):
    return (
        jsonify(
            error={
                "message": message,
                "type": "invalid_request_error",
                "code": code,
            }
        ),
        status,
    )
