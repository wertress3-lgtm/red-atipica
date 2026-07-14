@echo off
cd /d "%~dp0"
if not exist .venv (
  python -m venv .venv
)
call .venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -c "from app import app; app.run(host='0.0.0.0', port=5001, debug=False, use_reloader=False)"
pause
