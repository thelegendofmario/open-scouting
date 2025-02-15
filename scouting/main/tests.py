from django.test import TestCase, Client
from authentication.models import User, Profile
from main.models import Data, Event

import uuid
import json


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
        data = {
            "uuid": self.uuid,
            "data": "{}",
            "event_name": "test",
            "event_code": "test",
            "custom": "true",
            "year": 2024,
        }

        response = self.client.post("/submit", data, content_type="application/json")
        self.assertEqual(response.status_code, 200)

        data = Data.objects.first()
        self.assertEqual(data.event, "test")
        self.assertEqual(data.event_code, "test")
        self.assertEqual(data.year, 2024)
        self.assertEqual(data.data, {})
        self.assertEqual(data.event_model.custom, True)
        self.assertEqual(data.user_created, None)

    def test_submit_custom_authenticated(self):
        data = {
            "uuid": self.uuid,
            "data": "{}",
            "event_name": "test",
            "event_code": "test",
            "custom": "true",
            "year": 2024,
        }

        self.client.login(username="test", password="test")

        response = self.client.post("/submit", data, content_type="application/json")
        self.assertEqual(response.status_code, 200)

        data = Data.objects.first()
        self.assertEqual(data.event, "test")
        self.assertEqual(data.event_code, "test")
        self.assertEqual(data.year, 2024)
        self.assertEqual(data.data, {})
        self.assertEqual(data.event_model.custom, True)
        self.assertEqual(data.user_created, self.user)

    def test_submit_normal_anonymous(self):
        data = {
            "uuid": self.uuid,
            "data": "{}",
            "event_name": "test",
            "event_code": "test",
            "custom": "false",
            "year": 2024,
        }

        response = self.client.post("/submit", data, content_type="application/json")
        self.assertEqual(response.status_code, 200)

        data = Data.objects.first()
        self.assertEqual(data.event, "test")
        self.assertEqual(data.event_code, "test")
        self.assertEqual(data.year, 2024)
        self.assertEqual(data.data, {})
        self.assertEqual(data.event_model.custom, False)
        self.assertEqual(data.user_created, None)

    def test_submit_normal_authenticated(self):
        data = {
            "uuid": self.uuid,
            "data": "{}",
            "event_name": "test",
            "event_code": "test",
            "custom": "false",
            "year": 2024,
        }

        self.client.login(username="test", password="test")

        response = self.client.post("/submit", data, content_type="application/json")
        self.assertEqual(response.status_code, 200)

        data = Data.objects.first()
        self.assertEqual(data.event, "test")
        self.assertEqual(data.event_code, "test")
        self.assertEqual(data.year, 2024)
        self.assertEqual(data.data, {})
        self.assertEqual(data.event_model.custom, False)
        self.assertEqual(data.user_created, self.user)


class GetDataTest(TestCase):
    def setUp(self):
        self.client = Client()

        self.user = User.objects.create_user("test", "test", "test")
        self.user.save()

        profile = Profile(user=self.user, display_name="test", team_number="1234")
        profile.save()

    def test_get_data_demo(self):
        data = {
            "event_name": "test",
            "event_code": "test",
            "custom": "false",
            "year": 2024,
            "demo": "true",
        }

        response = self.client.post("/get_data", data, content_type="application/json")
        self.assertEqual(response.status_code, 200)

        self.assertEqual(response["Content-Type"], "application/json")
        response_json = json.loads(response.content)
        self.assertIn("demo", response_json)

    def test_get_data_custom(self):
        data = {
            "event_name": "test",
            "event_code": "test",
            "custom": "true",
            "year": 2024,
            "demo": "false",
        }

        response = self.client.post("/get_data", data, content_type="application/json")
        self.assertEqual(response.status_code, 200)

        self.assertEqual(response["Content-Type"], "application/json")

    def test_get_data_normal(self):
        data = {
            "event_name": "test",
            "event_code": "test",
            "custom": "false",
            "year": 2024,
            "demo": "false",
        }

        response = self.client.post("/get_data", data, content_type="application/json")
        self.assertEqual(response.status_code, 200)

        self.assertEqual(response["Content-Type"], "application/json")


class GetCustomEventsTest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_get_custom_events(self):
        data = {"year": 2024}

        response = self.client.post(
            "/get_custom_events", data, content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

        self.assertEqual(response["Content-Type"], "application/json")


class CreateCustomEventTest(TestCase):
    def setUp(self):
        self.client = Client()

        self.user = User.objects.create_user("test", "test", "test")
        self.user.save()

        profile = Profile(user=self.user, display_name="test", team_number="1234")
        profile.save()

    def test_create_custom_event_anonymous(self):
        data = {
            "name": "test",
            "year": 2024,
            "date_begins": "2024-01-01",
            "date_ends": "2024-01-01",
            "location": "test",
            "type": "test",
        }

        response = self.client.post(
            "/create_custom_event", data, content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

        event = Event.objects.first()
        self.assertEqual(event.year, 2024)
        self.assertEqual(event.name, "test")
        self.assertEqual(event.custom, True)

        self.assertEqual(event.custom_data["name"], "test")
        self.assertEqual(event.custom_data["year"], 2024)
        self.assertEqual(event.custom_data["date_begins"], "2024-01-01")
        self.assertEqual(event.custom_data["date_ends"], "2024-01-01")
        self.assertEqual(event.custom_data["location"], "test")
        self.assertEqual(event.custom_data["type"], "test")

    def test_create_custom_event_authenticated(self):
        data = {
            "name": "test",
            "year": 2024,
            "date_begins": "2024-01-01",
            "date_ends": "2024-01-01",
            "location": "test",
            "type": "test",
        }

        self.client.login(username="test", password="test")

        response = self.client.post(
            "/create_custom_event", data, content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

        event = Event.objects.first()
        self.assertEqual(event.year, 2024)
        self.assertEqual(event.name, "test")
        self.assertEqual(event.custom, True)
        self.assertEqual(event.user_created, self.user)

        self.assertEqual(event.custom_data["name"], "test")
        self.assertEqual(event.custom_data["year"], 2024)
        self.assertEqual(event.custom_data["date_begins"], "2024-01-01")
        self.assertEqual(event.custom_data["date_ends"], "2024-01-01")
        self.assertEqual(event.custom_data["location"], "test")
        self.assertEqual(event.custom_data["type"], "test")


class GetYearDataTest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_get_year_data(self):
        data = {"year": 2024}

        response = self.client.post(
            "/get_year_data", data, content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)

        self.assertEqual(response["Content-Type"], "application/json")


class CheckLocalBackupReportsTest(TestCase):
    def setUp(self):
        self.client = Client()

        session = self.client.session
        session["username"] = "test"
        session["team_number"] = "1234"
        session.save()

        self.user = User.objects.create_user("test", "test", "test")
        self.user.save()

        self.uuid = uuid.uuid4().hex

        profile = Profile(user=self.user, display_name="test", team_number="1234")
        profile.save()

    def test_check_local_backup_reports_custom_anonymous(self):
        data = {
            "data": json.dumps(
                [
                    {
                        "uuid": self.uuid,
                        "event_name": "test",
                        "event_code": "test",
                        "year": 2024,
                        "custom": True,
                        "data": {},
                    }
                ]
            ),
        }

        response = self.client.post(
            "/check_local_backup_reports", data, content_type="application/json"
        )

        data = json.loads(response.json())

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/json")
        self.assertEqual(data["reports_not_found"], 1)
        self.assertEqual(data["reports_found"], 0)

    def test_check_local_backup_reports_custom_authenticated(self):
        data = {
            "data": json.dumps(
                [
                    {
                        "uuid": self.uuid,
                        "event_name": "test",
                        "event_code": "test",
                        "year": 2024,
                        "custom": True,
                        "data": {},
                    }
                ]
            ),
        }

        self.client.login(username="test", password="test")
        response = self.client.post(
            "/check_local_backup_reports", data, content_type="application/json"
        )

        data = json.loads(response.json())

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/json")
        self.assertEqual(data["reports_not_found"], 1)
        self.assertEqual(data["reports_found"], 0)

    def test_check_local_backup_reports_normal_anonymous(self):
        data = {
            "data": json.dumps(
                [
                    {
                        "uuid": self.uuid,
                        "event_name": "test",
                        "event_code": "test",
                        "year": 2024,
                        "custom": False,
                        "data": {},
                    }
                ]
            ),
        }

        response = self.client.post(
            "/check_local_backup_reports", data, content_type="application/json"
        )

        data = json.loads(response.json())

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/json")
        self.assertEqual(data["reports_not_found"], 1)
        self.assertEqual(data["reports_found"], 0)

    def test_check_local_backup_reports_normal_authenticated(self):
        data = {
            "data": json.dumps(
                [
                    {
                        "uuid": self.uuid,
                        "event_name": "test",
                        "event_code": "test",
                        "year": 2024,
                        "custom": False,
                        "data": {},
                    }
                ]
            ),
        }

        self.client.login(username="test", password="test")
        response = self.client.post(
            "/check_local_backup_reports", data, content_type="application/json"
        )

        data = json.loads(response.json())

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/json")
        self.assertEqual(data["reports_not_found"], 1)
        self.assertEqual(data["reports_found"], 0)


class UploadOfflineReports(TestCase):
    def setUp(self):
        self.client = Client()

        session = self.client.session
        session["username"] = "test"
        session["team_number"] = "1234"
        session.save()

        self.user = User.objects.create_user("test", "test", "test")
        self.user.save()

        self.uuid = uuid.uuid4().hex

        profile = Profile(user=self.user, display_name="test", team_number="1234")
        profile.save()

    def test_upload_offline_reports_custom_anonymous(self):
        data = {
            "data": json.dumps(
                [
                    {
                        "uuid": self.uuid,
                        "event_name": "test",
                        "event_code": "test",
                        "year": 2024,
                        "custom": True,
                        "data": {},
                    }
                ]
            ),
        }

        response = self.client.post(
            "/upload_offline_reports", data, content_type="application/json"
        )

        data = json.loads(response.json())

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/json")
        self.assertEqual(data["reports_not_found"], 1)
        self.assertEqual(data["reports_found"], 0)

    def test_upload_offline_reports_custom_authenticated(self):
        data = {
            "data": json.dumps(
                [
                    {
                        "uuid": self.uuid,
                        "event_name": "test",
                        "event_code": "test",
                        "year": 2024,
                        "custom": True,
                        "data": {},
                    }
                ]
            ),
        }

        self.client.login(username="test", password="test")
        response = self.client.post(
            "/upload_offline_reports", data, content_type="application/json"
        )

        data = json.loads(response.json())

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/json")
        self.assertEqual(data["reports_not_found"], 1)
        self.assertEqual(data["reports_found"], 0)

    def test_upload_offline_reports_normal_anonymous(self):
        data = {
            "data": json.dumps(
                [
                    {
                        "uuid": self.uuid,
                        "event_name": "test",
                        "event_code": "test",
                        "year": 2024,
                        "custom": False,
                        "data": {},
                    }
                ]
            ),
        }

        response = self.client.post(
            "/upload_offline_reports", data, content_type="application/json"
        )

        data = json.loads(response.json())

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/json")
        self.assertEqual(data["reports_not_found"], 1)
        self.assertEqual(data["reports_found"], 0)

    def test_upload_offline_reports_normal_authenticated(self):
        data = {
            "data": json.dumps(
                [
                    {
                        "uuid": self.uuid,
                        "event_name": "test",
                        "event_code": "test",
                        "year": 2024,
                        "custom": False,
                        "data": {},
                    }
                ]
            ),
        }

        self.client.login(username="test", password="test")
        response = self.client.post(
            "/upload_offline_reports", data, content_type="application/json"
        )

        data = json.loads(response.json())

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/json")
        self.assertEqual(data["reports_not_found"], 1)
        self.assertEqual(data["reports_found"], 0)
