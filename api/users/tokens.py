from django.contrib.auth.tokens import PasswordResetTokenGenerator


class EmailVerificationTokenGenerator(PasswordResetTokenGenerator):
    """Distinct key_salt from Django's default_token_generator (used for password
    reset) so a verification link can never double as a password-reset link, and
    vice versa."""

    key_salt = "users.tokens.EmailVerificationTokenGenerator"

    def _make_hash_value(self, user, timestamp):
        return f"{user.pk}{user.password}{timestamp}{user.date_joined}"


email_verification_token = EmailVerificationTokenGenerator()
