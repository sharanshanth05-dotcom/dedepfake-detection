import hashlib
import os
import re
from datetime import datetime, timedelta
from typing import Optional, Union, Any
from pathlib import Path

# Magic bytes dictionary for strict file signature verification
MAGIC_BYTES = {
    # Images
    "image/jpeg": [b"\xff\xd8\xff"],
    "image/png": [b"\x89PNG\r\n\x1a\n"],
    "image/webp": [b"RIFF"],
    # Videos
    "video/mp4": [b"\x00\x00\x00\x18ftyp", b"\x00\x00\x00\x20ftyp", b"\x00\x00\x00\x1cftyp", b"ftyp"],
    "video/quicktime": [b"\x00\x00\x00\x14ftypqt", b"moov"],
    "video/webm": [b"\x1a\x45\xdf\xa3"],
    # Audios
    "audio/wav": [b"RIFF"],
    "audio/mpeg": [b"\xff\xfb", b"\xff\xf3", b"\xff\xf2", b"ID3"],
    "audio/flac": [b"fLaC"],
    "audio/mp4": [b"\x00\x00\x00\x20ftypM4A", b"\x00\x00\x00\x18ftypM4A", b"ftypM4A"]
}

def calculate_sha256(file_path: Union[str, Path]) -> str:
    """Computes SHA-256 hash of a file for forensic verification."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(65536), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def sanitize_filename(filename: str) -> str:
    """
    Sanitizes filename against path traversal and malicious characters.
    Replaces everything except alphanumeric, dots, dashes, underscores.
    """
    clean_name = os.path.basename(filename)
    clean_name = re.sub(r"[^a-zA-Z0-9._-]", "_", clean_name)
    return clean_name or "uploaded_media"

def verify_file_signature(file_path: Union[str, Path], expected_type: str) -> bool:
    """
    Checks magic bytes to prevent extension spoofing.
    Allows pass-through if header signature matches expected format.
    """
    try:
        with open(file_path, "rb") as f:
            header = f.read(32)
            
        ext = Path(file_path).suffix.lower()
        
        # Check image signatures
        if ext in [".jpg", ".jpeg"]:
            return header.startswith(b"\xff\xd8\xff")
        elif ext == ".png":
            return header.startswith(b"\x89PNG\r\n\x1a\n")
        elif ext == ".webp":
            return header.startswith(b"RIFF") and b"WEBP" in header[:16]
        elif ext == ".mp4":
            return b"ftyp" in header[:16]
        elif ext == ".webm":
            return header.startswith(b"\x1a\x45\xdf\xa3")
        elif ext == ".wav":
            return header.startswith(b"RIFF") and b"WAVE" in header[:16]
        elif ext == ".flac":
            return header.startswith(b"fLaC")
        elif ext == ".mp3":
            return header.startswith(b"\xff\xfb") or header.startswith(b"ID3") or header.startswith(b"\xff\xf3")
        
        # Fallback accept if within standard extensions
        return True
    except Exception:
        return False

def hash_password(password: str) -> str:
    """Hashes password with SHA256 + salt for simple demonstration."""
    salt = "truthlens_salt_2026_"
    return hashlib.sha256((salt + password).encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password
