"""Central email send path — every transactional email in the app goes
through here using Django's configured mail backend (Gmail SMTP)."""

import logging

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


def _send_via_email(subject, to, text, idempotency_key=None, reply_to=None):
    """Sends email via Django's configured mail backend (Gmail SMTP, console, etc.).
    Never raises — a failed email must not break the request/task that triggered it."""
    # Print to console for easy local development & debugging
    print(f"\n==================== 📧 OUTGOING EMAIL TO {to} ====================", flush=True)
    print(f"Subject: {subject}", flush=True)
    print(f"Body:\n{text}", flush=True)
    print("=========================================================\n", flush=True)
    logger.info("Outgoing email to %s | subject=%s", to, subject)

    try:
        from_email = getattr(settings, "DEFAULT_FROM_EMAIL", settings.EMAIL_HOST_USER or "Kiphaus <noreply@kiphaus.com>")
        send_mail(
            subject=subject,
            message=text,
            from_email=from_email,
            recipient_list=[to],
            fail_silently=False,
        )
        return True
    except Exception as exc:
        logger.warning("Django send_mail exception: %s", exc)
        return None


def send_email(subject, to, template, context=None, idempotency_key=None):
    """Renders a notifications/ text template and sends it via Django mail system."""
    body = render_to_string(template, context or {})
    return _send_via_email(subject, to, body, idempotency_key)


def send_raw_email(subject, to, text, idempotency_key=None, reply_to=None):
    """Sends a plain-text body directly, no template — for one-off
    transactional emails (verification links, password resets) that don't
    warrant their own template file."""
    return _send_via_email(subject, to, text, idempotency_key, reply_to)


def send_welcome_email(user):
    """Sent once per new account — direct signup or first social login."""
    return send_raw_email(
        subject="Welcome to Kiphaus",
        to=user.email,
        text=(
            f"Hi {user.first_name or user.username},\n\n"
            "Welcome to Kiphaus — India's verified marketplace for homestays, "
            "villas, and unique stays. Every listing is checked, and the price "
            "you see is the price you pay, no surprise fees at checkout.\n\n"
            "— The Kiphaus team"
        ),
        idempotency_key=f"welcome-email/{user.pk}",
    )
