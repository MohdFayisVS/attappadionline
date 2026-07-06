import json

log_path = r"C:\Users\moham\.gemini\antigravity\brain\ef2f3359-4317-49d1-8488-9b7e61f3cb99\.system_generated\logs\transcript.jsonl"
with open(log_path, "r", encoding="utf-8") as f:
    for line in f:
        data = json.loads(line)
        idx = data.get("step_index")
        if idx and 670 <= idx <= 720:
            content = data.get("content", "")
            if isinstance(content, str):
                safe_str = content.encode("ascii", "ignore").decode("ascii")[:400]
                print(idx, data.get("type"), safe_str)
                print("-" * 50)
