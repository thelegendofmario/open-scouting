from django.shortcuts import render, HttpResponse
from django.http import JsonResponse
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login

from . import email
from authentication.models import Profile, VerificationCode

import random
from datetime import timedelta


def generate_verification_code(length=6):
    verification_code = ""
    for i in range(length):
        verification_code += str(random.randint(0, 9))
    return verification_code


def auth(request):
    context = {
        "SERVER_IP": settings.SERVER_IP,
        "TBA_API_KEY": settings.TBA_API_KEY,
        "SERVER_MESSAGE": settings.SERVER_MESSAGE,
        "EMAIL_HOST_USER": settings.EMAIL_HOST_USER,
    }

    return render(request, "authentication.html", context)


def sign_in(request):
    """
    Signs the user in using the provided email and password and authenticates the session
    """
    pass


def forgot_password(request):
    """
    Sends the user a verification code to their email for resetting their password
    """
    pass


def change_password(request):
    """
    Changes the password of the user to a new one, only possible if the provided verification code is valid
    """
    pass


def send_verification_code(request):
    """
    Generate and send a verification code to the user

    Required Headers:
        uuid - The uuid of the user generated on the client
        email - The email the user provided which the verification code should be sent to
        display-name - The provided display name of the user

    Returns:
        expires - The expiration date and time of the code
        user_uuid - The uuid of the user generated on the client
    """

    if request.method == "POST":
        code = generate_verification_code()
        code_expires = timezone.now() + timedelta(minutes=10)

        code_object = VerificationCode(
            code=code,
            created=timezone.now(),
            expires=code_expires,
            user_uuid=request.headers["uuid"],
        )
        code_object.save()

        email.send_verify(
            [request.headers["email"]], request.headers["display-name"], code
        )

        return JsonResponse(
            {
                "expires": code_expires,
                "user_uuid": request.headers["uuid"],
            },
            safe=False,
        )

    else:
        return HttpResponse("Request is not a POST request!", status=501)


def check_verification_code(request):
    """
    Check a verification code the user entered on the client

    Required Headers:
        code - The verification code provided from the client
        user-uuid - The uuid of the user generated on the client

    Returns:
        valid - Whether or not the verification code is valid
        reason - The reason why or why not the code is valid
    """

    if request.method == "POST":
        code_object = VerificationCode.objects.filter(
            code=request.headers["code"], user_uuid=request.headers["user-uuid"]
        ).first()

        if code_object:
            if timezone.now() < code_object.expires:
                code_object.verified = True
                code_object.save()
                return JsonResponse({"valid": True, "reason": "valid"}, safe=False)

            else:
                return JsonResponse({"valid": False, "reason": "expired"}, safe=False)
        else:
            return JsonResponse(
                {"valid": False, "reason": "does_not_exist"}, safe=False, status=400
            )
    else:
        return HttpResponse("Request is not a POST request!", status=501)


def create_account(request):
    """
    Creates a new user account and signs the user in

    Required Headers:
        uuid - The uuid of the user
        display-name - The provided display name of the user
        team-number - The team number of the user
        email - The email the user provided
        password - The password the user is setting
    """

    if request.method == "POST":
        code_verified = VerificationCode.objects.filter(
            user_uuid=request.headers["uuid"], verified=True
        ).first()

        if code_verified:
            code_verified.delete()

            user = User.objects.create_user(
                request.headers["email"],
                request.headers["email"],
                request.headers["password"],
            )
            user.first_name = request.headers["display-name"]
            user.save()

            profile = Profile(
                user=user,
                display_name=request.headers["display-name"],
                team_number=request.headers["team-number"],
            )
            profile.save()

            email.send_welcome(
                [request.headers["email"]], request.headers["display-name"]
            )

            user = authenticate(
                request,
                username=request.headers["email"],
                password=request.headers["password"],
            )
            if user is not None:
                login(request, user)

                return HttpResponse("success", status=200)
            else:
                return HttpResponse("invalid login", status=401)
        else:
            return HttpResponse("invalid verification code", status=401)

    else:
        return HttpResponse("Request is not a POST request!", status=501)
