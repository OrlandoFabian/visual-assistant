"""Visual Assistant API.

Minimal Flask application skeleton. Feature endpoints (upload, chat,
chat-stream, history) are added per question in dedicated feature branches.
"""

from flask import Flask, jsonify


def create_app() -> Flask:
    """Application factory. Returns a configured Flask app."""
    app = Flask(__name__)

    @app.get("/health")
    def health():
        return jsonify(status="ok"), 200

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True, threaded=True)
