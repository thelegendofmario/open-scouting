from django.test import TestCase, Client
from authentication.models import User, Profile
from main.models import Data, Event

import uuid


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


class SubmitTest(TestCase):
    def setUp(self):
        self.client = Client()

        session = self.client.session
        session["username"] = "test"
        session["team_number"] = "1234"
        session.save()

        self.uuid = uuid.uuid4().hex

        self.user = User.objects.create_user("test", "test", "test")
        self.user.save()

        profile = Profile(user=self.user, display_name="test", team_number="1234")
        profile.save()

    def test_submit_custom_anonymous(self):
        headers = {
            "HTTP_UUID": self.uuid,
            "HTTP_DATA": "{}",
            "HTTP_EVENT_NAME": "test",
            "HTTP_EVENT_CODE": "test",
            "HTTP_CUSTOM": "true",
            "HTTP_YEAR": 2024,
        }

        response = self.client.post("/submit", **headers)
        self.assertEqual(response.status_code, 200)

        data = Data.objects.first()
        self.assertEqual(data.event, "test")
        self.assertEqual(data.event_code, "test")
        self.assertEqual(data.year, 2024)
        self.assertEqual(data.data, {})
        self.assertEqual(data.event_model.custom, True)
        self.assertEqual(data.user_created, None)

    def test_submit_custom_authenticated(self):
        headers = {
            "HTTP_UUID": self.uuid,
            "HTTP_DATA": "{}",
            "HTTP_EVENT_NAME": "test",
            "HTTP_EVENT_CODE": "test",
            "HTTP_CUSTOM": "true",
            "HTTP_YEAR": 2024,
        }

        self.client.login(username="test", password="test")

        response = self.client.post("/submit", **headers)
        self.assertEqual(response.status_code, 200)

        data = Data.objects.first()
        self.assertEqual(data.event, "test")
        self.assertEqual(data.event_code, "test")
        self.assertEqual(data.year, 2024)
        self.assertEqual(data.data, {})
        self.assertEqual(data.event_model.custom, True)
        self.assertEqual(data.user_created, self.user)

    def test_submit_normal_anonymous(self):
        headers = {
            "HTTP_UUID": self.uuid,
            "HTTP_DATA": "{}",
            "HTTP_EVENT_NAME": "test",
            "HTTP_EVENT_CODE": "test",
            "HTTP_CUSTOM": "false",
            "HTTP_YEAR": 2024,
        }

        response = self.client.post("/submit", **headers)
        self.assertEqual(response.status_code, 200)

        data = Data.objects.first()
        self.assertEqual(data.event, "test")
        self.assertEqual(data.event_code, "test")
        self.assertEqual(data.year, 2024)
        self.assertEqual(data.data, {})
        self.assertEqual(data.event_model.custom, False)
        self.assertEqual(data.user_created, None)

    def test_submit_normal_authenticated(self):
        headers = {
            "HTTP_UUID": self.uuid,
            "HTTP_DATA": "{}",
            "HTTP_EVENT_NAME": "test",
            "HTTP_EVENT_CODE": "test",
            "HTTP_CUSTOM": "false",
            "HTTP_YEAR": 2024,
        }

        self.client.login(username="test", password="test")

        response = self.client.post("/submit", **headers)
        self.assertEqual(response.status_code, 200)

        data = Data.objects.first()
        self.assertEqual(data.event, "test")
        self.assertEqual(data.event_code, "test")
        self.assertEqual(data.year, 2024)
        self.assertEqual(data.data, {})
        self.assertEqual(data.event_model.custom, False)
        self.assertEqual(data.user_created, self.user)
