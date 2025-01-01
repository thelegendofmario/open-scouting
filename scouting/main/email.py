from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings


def send_welcome(to, username):
    # First, render the plain text content.
    text_content = render_to_string(
        "emails/welcome.txt",
        context={"SERVER_IP": settings.SERVER_IP, "username": username, "email": to},
    )

    # Secondly, render the HTML content.
    html_content = render_to_string(
        "emails/welcome.html",
        context={"SERVER_IP": settings.SERVER_IP, "username": username, "email": to},
    )

    # Then, create a multipart email instance.
    msg = EmailMultiAlternatives(
        "Welcome to Open Scouting",
        text_content,
        settings.EMAIL_HOST_USER,
        to,
    )

    # Lastly, attach the HTML content to the email instance and send.
    msg.attach_alternative(html_content, "text/html")

    if settings.EMAIL_ENABLED:
        msg.send()
