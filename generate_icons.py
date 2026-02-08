import sys
import subprocess

def install_pillow():
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])

try:
    from PIL import Image
except ImportError:
    print("Pillow not found, installing...")
    install_pillow()
    from PIL import Image

import os

SOURCE_IMAGE = r"C:/Users/god/.gemini/antigravity/brain/699aa427-dd29-4b6b-a95e-82fe1672f8ec/codeclash_logo_1770438664714.png"
OUTPUT_DIR = r"c:\CodeClash\public"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

sizes = {
    "pwa-192x192.png": (192, 192),
    "pwa-512x512.png": (512, 512),
    "apple-touch-icon.png": (180, 180),
    "favicon.ico": (32, 32)
}

try:
    img = Image.open(SOURCE_IMAGE)
    # Ensure it's active and has alpha channel if needed (PNG source usually okay)
    img = img.convert("RGBA")

    for filename, size in sizes.items():
        out_path = os.path.join(OUTPUT_DIR, filename)
        resized_img = img.resize(size, Image.Resampling.LANCZOS)
        resized_img.save(out_path)
        print(f"Generated {filename}")

    print("All icons generated successfully.")

except Exception as e:
    print(f"Error generating icons: {e}")
