import subprocess

res = subprocess.run(["git", "show", "0fddb63:server.ts"], capture_output=True, text=True, encoding="utf-8")
lines = res.stdout.split("\n")

output = []
for i, line in enumerate(lines):
    if "const defaultAdConfig =" in line:
        for j in range(max(0, i-2), min(len(lines), i+30)):
            output.append(f"{j+1}: {lines[j]}")

with open("scratch/ad_config_output.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(output))

print("Wrote output to scratch/ad_config_output.txt successfully!")
