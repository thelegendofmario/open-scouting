from django.test import TestCase, Client
from authentication.models import User, Profile


class IndexPageTest(TestCase):
    def setUp(self):
        self.client = Client()

        user = User.objects.create_user("test", "test", "test")
        user.save()

        profile = Profile(user=user, display_name="test", team_number="1234")
        profile.save()

    def test_index_anonymous(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)

    def test_index_authenticated(self):
        self.client.login(username="test", password="test")
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)


class ContributePageTest(TestCase):
    def setUp(self):
        self.client = Client()

        user = User.objects.create_user("test", "test", "test")
        user.save()

        profile = Profile(user=user, display_name="test", team_number="1234")
        profile.save()

    def test_contribute_anonymous(self):
        response = self.client.get("/contribute")
        self.assertEqual(response.status_code, 200)

    def test_contribute_authenticated(self):
        self.client.login(username="test", password="test")
        response = self.client.get("/contribute")
        self.assertEqual(response.status_code, 200)


class DataPageTest(TestCase):
    def setUp(self):
        self.client = Client()

        user = User.objects.create_user("test", "test", "test")
        user.save()

        profile = Profile(user=user, display_name="test", team_number="1234")
        profile.save()

    def test_data_anonymous(self):
        response = self.client.get("/data")
        self.assertEqual(response.status_code, 200)

    def test_data_authenticated(self):
        self.client.login(username="test", password="test")
        response = self.client.get("/data")
        self.assertEqual(response.status_code, 200)


class ServiceWorkerPageTest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_service_worker(self):
        response = self.client.get("/sw.js")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/javascript")
