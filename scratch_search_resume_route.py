with open(r"c:\Users\Asif Ali\Desktop\Rahul\JobsDart-web\src\app\api\users\[id]\route.ts", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "resume" in line.lower():
        print(f"Line {i+1}: {line.strip()}")
