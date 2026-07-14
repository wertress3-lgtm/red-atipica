#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -c 'from app import app; app.run(host="0.0.0.0", port=5001, debug=False, use_reloader=False)'
