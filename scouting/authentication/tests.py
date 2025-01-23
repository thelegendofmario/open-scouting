from django.test import TestCase, Client
from authentication.models import User, Profile


class AuthenticationPageTest(TestCase):
    def setUp(self):
        self.client = Client()

        user = User.objects.create_user("test", "test", "test")
        user.save()

        profile = Profile(user=user, display_name="test", team_number="1234")
        profile.save()

    def test_authentication_anonymous(self):
        response = self.client.get("/authentication/")
        self.assertEqual(response.status_code, 200)

    def test_authentication_authenticated(self):
        self.client.login(username="test", password="test")
        response = self.client.get("/authentication/")
        self.assertEqual(response.status_code, 200)


class SignInTest(TestCase):
    def setUp(self):
        self.client = Client()

        user = User.objects.create_user("test", "test", "test")
        user.save()

        profile = Profile(user=user, display_name="test", team_number="1234")
        profile.save()

    def test_sign_in(self):
        headers = {
            "HTTP_EMAIL": "test",
            "HTTP_PASSWORD": "test",
        }

        response = self.client.post("/authentication/sign_in", **headers)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(self.client.session.get("_auth_user_id"))


class SignOutTest(TestCase):
    def setUp(self):
        self.client = Client()

        user = User.objects.create_user("test", "test", "test")
        user.save()

        profile = Profile(user=user, display_name="test", team_number="1234")
        profile.save()

    def test_sign_out(self):
        self.client.login(username="test", password="test")
        response = self.client.post("/authentication/sign_out")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(self.client.session.get("_auth_user_id"))


# TODO: Implement this test when the corresponding feature is implemented
# class ForgotPasswordTest(TestCase):
#     def setUp(self):
#         self.client = Client()

#         user = User.objects.create_user("test", "test", "test")
#         user.save()

#         profile = Profile(user=user, display_name="test", team_number="1234")
#         profile.save()

#     def test_forgot_password_anonymous(self):
#         pass

#     def test_forgot_password_authenticated(self):
#         pass


# TODO: Implement this test when the corresponding feature is implemented
# class ChangePasswordTest(TestCase):
#     def setUp(self):
#         self.client = Client()

#         user = User.objects.create_user("test", "test", "test")
#         user.save()

#         profile = Profile(user=user, display_name="test", team_number="1234")
#         profile.save()

#     def test_change_password_anonymous(self):
#         pass

#     def test_change_password_authenticated(self):
#         pass
