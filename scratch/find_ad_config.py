import subprocess
import json

res = subprocess.run(["git", "show", "0fddb63:data/db.json"], capture_output=True, text=True, encoding="utf-8")
db = json.loads(res.stdout)

for key, val in db.items():
    if isinstance(val, list):
        print(f"Collection [{key}] IDs:", [x.get("id") for x in val])
