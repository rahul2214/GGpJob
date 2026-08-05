import os

root_dir = r"c:\Users\Asif Ali\Desktop\Rahul\JobsDart-web\src"

for dirpath, dirnames, filenames in os.walk(root_dir):
    for filename in filenames:
        if "profile" in filename.lower() and filename.endswith(('.tsx', '.ts')):
            filepath = os.path.join(dirpath, filename)
            print(f"Profile file: {filepath}")
