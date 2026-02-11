from pathlib import Path

ROOT = Path(".")

for path in sorted(ROOT.rglob("*")):
    if any(part in {".git", "venv", "node_modules", "__pycache__"} for part in path.parts):
        continue
    print(path)
