"""
Contact Message Processing and Spam Protection Service.
Encapsulates form validation, link threshold analysis, keyword spam filters,
IP rate limiting, sliding window duplicate protection, and message creation.
"""

from datetime import timedelta
import re
from typing import Any, Dict, Tuple
from django.utils import timezone
from ..models import ContactMessage
from .security_service import SecurityService


class ContactMessageService:
    """Service to handle secure contact form submissions."""

    SPAM_PATTERNS = [
        r'\bcrypto\b',
        r'\bcasino\b',
        r'\bviagra\b',
        r'\bseo\s+service\b',
        r'\bbuy\s+backlinks\b',
        r'\btelegram\s*:\s*@',
        r'\bwhatsapp\s*:\s*\+',
    ]

    MAX_MESSAGE_LINKS = 2
    MAX_MESSAGE_LENGTH = 5000
    MIN_MESSAGE_LENGTH = 10
    MIN_NAME_LENGTH = 2

    # Rate limiting thresholds
    IP_WINDOW_MINUTES = 10
    IP_MAX_REQUESTS = 10
    EMAIL_WINDOW_MINUTES = 10
    EMAIL_MAX_REQUESTS = 5
    DUPLICATE_WINDOW_HOURS = 24

    @classmethod
    def validate_content_and_spam(cls, full_name: str, email: str, message: str) -> Tuple[bool, str | None]:
        """
        Validate message content for lengths, spam keywords, and link flooding.
        Returns (is_valid, error_message).
        """
        if len(full_name) < cls.MIN_NAME_LENGTH:
            return False, "Please enter your full name (at least 2 characters)."

        if len(message) < cls.MIN_MESSAGE_LENGTH:
            return False, "Message is too short. Please provide more details."

        if len(message) > cls.MAX_MESSAGE_LENGTH:
            return False, f"Message is too long (maximum {cls.MAX_MESSAGE_LENGTH} characters)."

        # Check link density
        url_hits = len(re.findall(r'https?://|www\.', message, flags=re.IGNORECASE))
        if url_hits > cls.MAX_MESSAGE_LINKS:
            return False, "Too many links detected in message."

        # Check spam patterns
        if any(re.search(pat, message, flags=re.IGNORECASE) for pat in cls.SPAM_PATTERNS):
            return False, "Message was flagged by automated spam protection."

        return True, None

    @classmethod
    def check_rate_limits_and_duplicates(
        cls, email: str, message: str, ip_address: str | None
    ) -> Tuple[bool, int, str | None]:
        """
        Check IP rate limit, email rate limit, and duplicate message submission.
        Returns (allowed, http_status_code, error_message).
        """
        now = timezone.now()
        recent_ip_window = now - timedelta(minutes=cls.IP_WINDOW_MINUTES)
        recent_email_window = now - timedelta(minutes=cls.EMAIL_WINDOW_MINUTES)
        duplicate_window = now - timedelta(hours=cls.DUPLICATE_WINDOW_HOURS)

        # 1. IP rate limit check
        if ip_address:
            ip_count = ContactMessage.objects.filter(
                ip_address=ip_address,
                created_at__gte=recent_ip_window,
            ).count()
            if ip_count >= cls.IP_MAX_REQUESTS:
                return False, 429, "Too many requests from your network. Please wait a few minutes before sending again."

        # 2. Email rate limit check
        email_count = ContactMessage.objects.filter(
            email=email,
            created_at__gte=recent_email_window,
        ).count()
        if email_count >= cls.EMAIL_MAX_REQUESTS:
            return False, 429, "Too many messages sent with this email. Please try again later."

        # 3. Duplicate message check
        is_duplicate = ContactMessage.objects.filter(
            email=email,
            message=message,
            created_at__gte=duplicate_window,
        ).exists()
        if is_duplicate:
            return False, 409, "Duplicate message detected. Your previous message has already been received."

        return True, 200, None

    @classmethod
    def create_message(
        cls,
        full_name: str,
        email: str,
        message: str,
        is_urgent: bool = False,
        source: str = "portfolio_site",
        request: Any = None,
    ) -> ContactMessage:
        """Create and persist a sanitized ContactMessage instance."""
        ip_address = SecurityService.extract_client_ip(request) if request else None
        user_agent = (request.META.get('HTTP_USER_AGENT') or '')[:255] if request else ''

        clean_name = SecurityService.sanitize_text(full_name, max_length=120)
        clean_email = email.strip().lower()
        clean_msg = SecurityService.sanitize_text(message, max_length=cls.MAX_MESSAGE_LENGTH)

        return ContactMessage.objects.create(
            full_name=clean_name,
            email=clean_email,
            message=clean_msg,
            is_urgent=bool(is_urgent),
            source=source,
            ip_address=ip_address,
            user_agent=user_agent,
        )
