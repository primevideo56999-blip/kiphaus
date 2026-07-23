from .base import *

DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# Use local file storage in dev instead of S3
DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Disable HTTPS redirects locally
SECURE_SSL_REDIRECT = False

# Use console email backend in dev if SMTP credentials are not configured
if not env("EMAIL_HOST_USER", default=""):
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
