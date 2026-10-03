"""Application factory for the Visual Assistant API."""

import os

from flask import Flask

from app.api import register_blueprints
from app.api.errors import register_error_handlers


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["UPLOAD_FOLDER"] = os.environ.get("UPLOAD_FOLDER", "uploads")
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024
    register_blueprints(app)
    register_error_handlers(app)
    return app


app = create_app()
