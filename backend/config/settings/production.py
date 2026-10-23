from .base import *  # noqa: F403

DEBUG = False
SECURE_SSL_REDIRECT = env("SECURE_SSL_REDIRECT")
# The platform health check calls the service directly over HTTP; it must not be redirected.
SECURE_REDIRECT_EXEMPT = [r"^api/v1/health/$"]
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
# Password-reset and other mail goes out over SMTP; host and credentials come from the environment.
EMAIL_BACKEND = env("EMAIL_BACKEND", default="django.core.mail.backends.smtp.EmailBackend")  # noqa: F405
