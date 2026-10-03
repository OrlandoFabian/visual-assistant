"""Local development entry point.

Prefer `make dev` (via docker-compose) in normal workflow. This file exists so
`python run.py` works when running without Docker.
"""

from app import app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True, threaded=True)
