"""
Portfolio Utilities and Common Helper Functions.
All administrative management is handled by the dedicated REST API (admin_api).
"""

from decimal import Decimal, InvalidOperation
from django.utils.text import slugify


def parse_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def parse_decimal(value):
    if value is None or str(value).strip() == "":
        return None
    try:
        cleaned = str(value).strip().replace("$", "").replace(",", "")
        dec = Decimal(cleaned)
        return dec if dec >= 0 else None
    except (InvalidOperation, TypeError, ValueError):
        return None


def generate_unique_slug(model_class, raw_value, slug_field="slug", max_attempts=1000):
    """Generate a unique slug for a model class using numeric suffixes when needed."""
    base_slug = slugify(raw_value or "item") or "item"

    existing_slugs = set(
        model_class.objects.filter(
            **{f"{slug_field}__startswith": base_slug}
        ).values_list(slug_field, flat=True)
    )

    if base_slug not in existing_slugs:
        return base_slug

    slug_prefix = f"{base_slug}-"
    used_suffixes = {
        int(suffix)
        for slug in existing_slugs
        if slug.startswith(slug_prefix)
        for suffix in [slug[len(slug_prefix):]]
        if suffix.isdigit()
    }

    for counter in range(1, max_attempts + 1):
        if counter not in used_suffixes:
            return f"{base_slug}-{counter}"

    raise ValueError(f"Could not generate a unique slug for '{base_slug}'")
