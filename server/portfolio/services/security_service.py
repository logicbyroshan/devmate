"""
Security and Request Utilities Service.
Handles IP resolution, constant-time API key verification, safe sanitization,
and host authorization helpers.
"""

import ipaddress
import re
import secrets
from django.conf import settings


class SecurityService:
    @staticmethod
    def is_localhost_request(request) -> bool:
        """Check if request originates from localhost / loopback."""
        try:
            host = (request.get_host() or '').split(':', 1)[0].strip().lower()
        except Exception:
            return False
        return host in {'localhost', '127.0.0.1', '::1'}

    @staticmethod
    def extract_client_ip(request) -> str | None:
        """
        Safely extract client IP from request.
        Only trusts X-Forwarded-For if explicitly configured via TRUST_X_FORWARDED_FOR.
        """
        candidates = []

        if getattr(settings, 'TRUST_X_FORWARDED_FOR', False):
            forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR', '')
            if forwarded_for:
                candidates.append(forwarded_for.split(',')[0].strip())

        candidates.append(request.META.get('REMOTE_ADDR'))

        for candidate in candidates:
            if not candidate:
                continue
            try:
                # Validates IP syntax (IPv4/IPv6)
                ip_obj = ipaddress.ip_address(candidate.strip())
                return str(ip_obj)
            except ValueError:
                continue

        return None

    @staticmethod
    def verify_api_key(request) -> bool:
        """
        Validate X-API-Key header using constant-time comparison.
        Bypassed if API_KEY setting is empty or on localhost during debug.
        """
        configured_key = (getattr(settings, 'API_KEY', '') or '').strip()
        if not configured_key:
            return True

        if getattr(settings, 'DEBUG', False) and SecurityService.is_localhost_request(request):
            return True

        api_key = (request.headers.get('X-API-Key') or '').strip()
        if not api_key:
            return False

        return secrets.compare_digest(api_key, configured_key)

    @staticmethod
    def sanitize_text(text: str, max_length: int = 5000) -> str:
        """Sanitize plain text inputs, normalize whitespace, strip control characters."""
        if not text:
            return ""
        cleaned = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', str(text))
        cleaned = cleaned.strip()
        if max_length and len(cleaned) > max_length:
            cleaned = cleaned[:max_length]
        return cleaned
