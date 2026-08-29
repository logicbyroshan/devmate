from rest_framework import serializers
from django.utils.text import slugify
from portfolio.models import Category, build_unique_slug


class AdminCategorySerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)
    item_count = serializers.SerializerMethodField()
    category_type_display = serializers.CharField(
        source="get_category_type_display", read_only=True
    )

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "category_type",
            "category_type_display",
            "description",
            "icon",
            "color",
            "item_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_item_count(self, obj):
        return obj.item_count()

    def validate(self, attrs):
        if not attrs.get("slug") and attrs.get("name"):
            base = slugify(attrs["name"]) or "category"
            existing = set(
                Category.objects.filter(slug__startswith=base)
                .values_list("slug", flat=True)
            )
            attrs["slug"] = build_unique_slug(base, existing)
        return attrs

