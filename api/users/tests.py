from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.db import IntegrityError
from django.test import TestCase

from .models import SocialAccount, User


class PasswordValidationTests(TestCase):
    def test_weak_password_is_rejected(self):
        with self.assertRaises(ValidationError):
            validate_password("1")

    def test_reasonable_password_is_accepted(self):
        # Should not raise.
        validate_password("correct-horse-battery-staple-9")


class SocialAccountModelTests(TestCase):
    def test_provider_and_provider_user_id_must_be_unique_together(self):
        user = User.objects.create_user(username="alice", email="alice@example.com")
        SocialAccount.objects.create(user=user, provider="google", provider_user_id="sub-123", email="alice@example.com")
        with self.assertRaises(IntegrityError):
            SocialAccount.objects.create(user=user, provider="google", provider_user_id="sub-123", email="alice@example.com")
