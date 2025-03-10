import os

UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
print(f"[INFO] Ensured upload directory exists: {UPLOAD_FOLDER}")
os.makedirs(PROCESSED_FOLDER, exist_ok=True)
print(f"[INFO] Ensured processed directory exists: {PROCESSED_FOLDER}")
