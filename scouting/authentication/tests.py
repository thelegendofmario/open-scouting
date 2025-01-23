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

        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, "/")
