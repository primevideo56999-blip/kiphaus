from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.test import TestCase


class PasswordValidationTests(TestCase):
    def test_weak_password_is_rejected(self):
        with self.assertRaises(ValidationError):
            validate_password("1")

    def test_reasonable_password_is_accepted(self):
        # Should not raise.
        validate_password("correct-horse-battery-staple-9")
