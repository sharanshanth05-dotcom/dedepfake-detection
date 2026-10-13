import base64
import io
import cv2
import numpy as np
from PIL import Image
from pathlib import Path
from typing import Tuple, List, Dict, Any, Optional

# Prevent decompression bomb DOS attacks
Image.MAX_IMAGE_PIXELS = 50_000_000

# Load OpenCV's built-in Haar cascade face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

def load_and_validate_image(image_path: Path) -> Tuple[Image.Image, Dict[str, Any]]:
    """Loads image, checks resolution and integrity, returns PIL image and metadata."""
    try:
        with Image.open(image_path) as img:
            img.verify()
        
        # Re-open after verify
        img = Image.open(image_path).convert("RGB")
        width, height = img.size
        
        if width < 32 or height < 32:
            raise ValueError(f"Image dimensions too small ({width}x{height}) for neural processing.")
        
        metadata = {
            "width": width,
            "height": height,
            "channels": 3,
            "format": img.format or image_path.suffix.upper().replace(".", ""),
            "mode": img.mode
        }
        return img, metadata
    except Exception as e:
        raise ValueError(f"Invalid or corrupted image file: {str(e)}")

def detect_faces(image: Image.Image) -> List[Dict[str, int]]:
    """Detects facial bounding boxes using Haar Cascade."""
    cv_img = np.array(image)
    gray = cv2.cvtColor(cv_img, cv2.COLOR_RGB2GRAY)
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30)
    )
    
    results = []
    for (x, y, w, h) in faces:
        results.append({
            "x": int(x),
            "y": int(y),
            "width": int(w),
            "height": int(h),
            "w": int(w),
            "h": int(h)
        })
    return results

def pil_to_base64(img: Image.Image, format: str = "JPEG") -> str:
    """Converts PIL image to base64 data URI."""
    buffered = io.BytesIO()
    img.save(buffered, format=format, quality=85)
    encoded = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/{format.lower()};base64,{encoded}"

def generate_heatmap_overlay(
    original_img: Image.Image,
    attention_map: np.ndarray,
    alpha: float = 0.5
) -> Image.Image:
    """
    Overlays a normalized attention/manipulation map (0..1) on the original image
    using OpenCV colormap JET.
    """
    orig_np = np.array(original_img)
    orig_h, orig_w = orig_np.shape[:2]
    
    # Resize attention map to original image resolution
    attn_resized = cv2.resize(attention_map, (orig_w, orig_h), interpolation=cv2.INTER_CUBIC)
    
    # Clip and normalize 0..255
    attn_norm = np.clip(attn_resized, 0.0, 1.0)
    attn_uint8 = (attn_norm * 255).astype(np.uint8)
    
    # Apply colormap JET
    heatmap = cv2.applyColorMap(attn_uint8, cv2.COLORMAP_JET)
    heatmap_rgb = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
    
    # Blend with original
    blended = cv2.addWeighted(orig_np, 1 - alpha, heatmap_rgb, alpha, 0)
    return Image.fromarray(blended)
