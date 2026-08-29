"""
Security utilities for Admin API.
Provides file validation, path traversal defense, MIME verification,
and HTML/text sanitization.
"""

import os
import re
from django.core.exceptions import ValidationError
from django.utils.html import escape

# Allowed MIME and Extension Sets
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"}
ALLOWED_IMAGE_MIMES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "image/gif",
}

ALLOWED_DOCUMENT_EXTENSIONS = {".pdf"}
ALLOWED_DOCUMENT_MIMES = {"application/pdf"}

MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB per single asset


def sanitize_filename(filename):
    """
    Sanitize uploaded filename to prevent directory traversal and null byte injections.
    """
    if not filename:
        return "unnamed_file"

    # Remove null bytes and path separators
    cleaned = filename.replace("\x00", "").replace("/", "").replace("\\", "")
    # Remove leading dots to prevent hidden files or traversal
    cleaned = re.sub(r"^\.+", "", cleaned)
    # Replace non-standard characters
    cleaned = re.sub(r"[^\w\.\-_]", "_", cleaned)
    return cleaned or "safe_file"


def validate_uploaded_image(file_obj, max_size=MAX_FILE_SIZE_BYTES):
    """
    Validates that the uploaded file is a safe, allowed image.
    Raises ValidationError on failure.
    """
    if not file_obj:
        return

    # Check file size
    if file_obj.size > max_size:
        raise ValidationError(
            f"File size ({file_obj.size / (1024*1024):.1f} MB) exceeds maximum allowed limit ({max_size / (1024*1024):.0f} MB)."
        )

    # Check extension
    name, ext = os.path.splitext(file_obj.name or "")
    ext_lower = ext.lower()
    if ext_lower not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationError(
            f"Invalid file extension '{ext}'. Allowed image extensions: {', '.join(sorted(ALLOWED_IMAGE_EXTENSIONS))}."
        )

    # Check content type if available
    content_type = getattr(file_obj, "content_type", "").lower()
    if content_type and content_type not in ALLOWED_IMAGE_MIMES and content_type != "application/octet-stream":
        raise ValidationError(
            f"Invalid MIME content-type '{content_type}' for image upload."
        )


def validate_uploaded_document(file_obj, max_size=MAX_FILE_SIZE_BYTES):
    """
    Validates that the uploaded file is a safe document (PDF).
    """
    if not file_obj:
        return

    if file_obj.size > max_size:
        raise ValidationError(
            f"File size exceeds maximum allowed limit ({max_size / (1024*1024):.0f} MB)."
        )

    name, ext = os.path.splitext(file_obj.name or "")
    ext_lower = ext.lower()
    if ext_lower not in ALLOWED_DOCUMENT_EXTENSIONS and ext_lower not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationError(
            f"Invalid document extension '{ext}'. Allowed extensions: PDF or Image."
        )


def sanitize_html(content):
    """
    Sanitize HTML string to eliminate XSS vectors (<script>, <iframe>, javascript:, onload, etc.).
    Preserves safe markup like <p>, <b>, <i>, <code>, <ul>, <ol>, <li>, <h1>-<h6>, <a>, <img>.
    """
    if not content or not isinstance(content, str):
        return content or ""

    # Remove script tags and contents
    cleaned = re.sub(r"<script.*?>.*?</script>", "", content, flags=re.IGNORECASE | re.DOTALL)
    # Remove iframe tags and contents
    cleaned = re.sub(r"<iframe.*?>.*?</iframe>", "", cleaned, flags=re.IGNORECASE | re.DOTALL)
    # Remove object / embed tags
    cleaned = re.sub(r"<(object|embed|applet).*?>.*?</\1>", "", cleaned, flags=re.IGNORECASE | re.DOTALL)
    # Remove javascript: protocol in attributes
    cleaned = re.sub(r"href=[\"']\s*javascript:[^\"']*[\"']", 'href="#"', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"src=[\"']\s*javascript:[^\"']*[\"']", 'src="#"', cleaned, flags=re.IGNORECASE)
    # Remove inline event handlers like onclick=, onerror=, onload=
    cleaned = re.sub(r"\son\w+\s*=\s*[\"'][^\"']*[\"']", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\son\w+\s*=\s*[^ >]+", "", cleaned, flags=re.IGNORECASE)

    return cleaned.strip()
