from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, HostProfile, SocialAccount


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ["email", "full_name", "role", "is_verified", "phone_verified", "date_joined"]
    list_filter   = ["role", "is_verified", "phone_verified", "is_active"]
    search_fields = ["email", "first_name", "last_name"]
    ordering      = ["-date_joined"]
    fieldsets     = BaseUserAdmin.fieldsets + (
        ("Platform", {"fields": ("role", "phone", "phone_verified", "avatar", "bio", "is_verified")}),
    )


@admin.register(HostProfile)
class HostProfileAdmin(admin.ModelAdmin):
    list_display  = ["user", "business_name", "is_superhost", "response_rate"]
    list_filter   = ["is_superhost"]
    search_fields = ["user__email", "business_name"]


@admin.register(SocialAccount)
class SocialAccountAdmin(admin.ModelAdmin):
    list_display  = ["user", "provider", "email", "created_at"]
    list_filter   = ["provider"]
    search_fields = ["user__email", "email", "provider_user_id"]
