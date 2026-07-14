from __future__ import annotations

import io
import json
import os
import socket
from pathlib import Path
from typing import Any
from urllib.parse import unquote

import qrcode
from flask import Flask, jsonify, render_template, request, send_file

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "bootstrap.json"

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False


def load_data() -> dict[str, Any]:
    with DATA_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)


def local_ip() -> str:
    """Best-effort local IP for showing a QR that works on the same WiFi."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"
    finally:
        s.close()




@app.after_request
def add_no_cache_headers(response):
    if request.path == "/" or request.path.startswith("/api/") or request.path.startswith("/static/"):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response


@app.get("/health")
def health():
    return {"status": "ok"}, 200


@app.route("/")
def index():
    return render_template("index.html")


@app.get("/api/bootstrap")
def bootstrap():
    return jsonify(load_data())


@app.get("/api/local-url")
def api_local_url():
    current = request.url_root.rstrip("/")
    host = request.host.split(":", 1)[0].lower()
    is_public = host not in {"127.0.0.1", "localhost"} and not host.startswith("192.168.") and not host.startswith("10.")
    if is_public:
        target = current
        note = "Este QR abre la versión pública de RED ATÍPICA desde cualquier dispositivo con internet."
    else:
        port = request.host.split(":", 1)[1] if ":" in request.host else "5000"
        target = f"http://{local_ip()}:{port}"
        note = "En modo local, ambos equipos deben estar conectados a la misma red WiFi."
    return jsonify({"current": current, "local": target, "note": note})


@app.get("/qr.png")
def qr_png():
    url = unquote(request.args.get("url", request.url_root.rstrip("/")))
    img = qrcode.make(url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return send_file(buf, mimetype="image/png", max_age=0)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False, use_reloader=False)
