import os

root_dir = r"c:\Users\Asif Ali\Desktop\Rahul\JobsDart-web\src\app\api"

for dirpath, dirnames, filenames in os.walk(root_dir):
    for filename in filenames:
        if "resume" in filename.lower() or "resume" in dirpath.lower():
            filepath = os.path.join(dirpath, filename)
            print(f"Resume API route: {filepath}")
