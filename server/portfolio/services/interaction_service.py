"""
Interaction and Analytics Service.
Provides atomic counters for project views and likes using F-expressions.
"""

from typing import Optional, Tuple
from django.db.models import F
from ..models import Project


class InteractionService:
    """Service to handle atomic project interaction counters."""

    @staticmethod
    def increment_views(slug_or_id: str | int) -> Tuple[bool, Optional[int]]:
        """Atomically increment views on a project."""
        try:
            if isinstance(slug_or_id, int) or (isinstance(slug_or_id, str) and slug_or_id.isdigit()):
                qs = Project.objects.filter(pk=int(slug_or_id))
            else:
                qs = Project.objects.filter(slug=slug_or_id)

            updated = qs.update(views=F("views") + 1)
            if updated:
                views_count = qs.values_list("views", flat=True).first()
                return True, views_count
            return False, None
        except Exception:
            return False, None

    @staticmethod
    def increment_likes(slug_or_id: str | int) -> Tuple[bool, Optional[int]]:
        """Atomically increment likes on a project."""
        try:
            if isinstance(slug_or_id, int) or (isinstance(slug_or_id, str) and slug_or_id.isdigit()):
                qs = Project.objects.filter(pk=int(slug_or_id))
            else:
                qs = Project.objects.filter(slug=slug_or_id)

            updated = qs.update(likes=F("likes") + 1)
            if updated:
                likes_count = qs.values_list("likes", flat=True).first()
                return True, likes_count
            return False, None
        except Exception:
            return False, None
