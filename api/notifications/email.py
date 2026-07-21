"""Central Resend send path — every transactional email in the app goes
through here so there's exactly one place that touches the Resend API."""

import logging

import resend
from django.conf import settings
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


def _send_via_resend(subject, to, text, idempotency_key=None, reply_to=None):
    """Never raises — a failed email must not break the request/task that
    triggered it. Returns the Resend response dict, or None on failure."""
    resend.api_key = settings.RESEND_API_KEY
    try:
        params = {
            "from": settings.DEFAULT_FROM_EMAIL,
            "to": [to],
            "subject": subject,
            "text": text,
        }
        if reply_to:
            params["reply_to"] = reply_to
        options = {"idempotency_key": idempotency_key} if idempotency_key else None
        return resend.Emails.send(params, options)
    except Exception as exc:
        logger.error("Email send failed | to=%s | subject=%s | %s", to, subject, exc)
        return None


def send_email(subject, to, template, context=None, idempotency_key=None):
    """Renders a notifications/ text template and sends it via Resend."""
    body = render_to_string(template, context or {})
    return _send_via_resend(subject, to, body, idempotency_key)


def send_raw_email(subject, to, text, idempotency_key=None, reply_to=None):
    """Sends a plain-text body directly, no template — for one-off
    transactional emails (verification links, password resets) that don't
    warrant their own template file."""
    return _send_via_resend(subject, to, text, idempotency_key, reply_to)


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
