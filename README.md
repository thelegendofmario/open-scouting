<div align="center">

  ![Open Scouting logo](repo/images/icon.png)

  <h1>Open Scouting</h1>

  **An open source application for easier scouting at First Robotics competitions**

  **[Releases](https://github.com/nfoert/open-scouting/releases) ● [Issues](https://github.com/nfoert/open-scouting/issues) ● [Development branch](https://github.com/nfoert/open-scouting/tree/development)**

</div>

<div align="center">

  ![Open Scouting screenshot on mobile](repo/images/mobile.png)

</div>

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=django,python,html,css,js,tailwind" />
  </a>
</p>


## Features
- Save data offline in case of poor connection in the stands
- Work with The Blue Alliance's API to grab match data allowing to autofill team numbers
- Tie multiple clients together into a "session" so all the devices can be sent to the next match simultaneously
  - This will iterate the match number and help autofill some additional information
- Auto jump to the next section that needs filled out
- Have an custom interface for viewing all the collected data
- Have a system for quickly setting up all the required data entries for a new season
  - Have fields to quickly set up and provide to the user when scouting, e.g. "text", "boolean", "data" ect.
- Allow other teams to view and contribute data to the same server
- Create custom events if events aren't listed on TBA
- Keep backups of scouting reports locally
- Dark/light mode theme support
- Manually go offline in case of bad connection

## Development Installation
Follow these steps to get the server running locally for contributing or development

First, clone this repository using the following command
```bash
git clone https://github.com/nfoert/open-scouting
```

Then, navigate to that directory and create a new python virtual environment
```bash
cd scouting
python3 -m venv .venv
```

Activate the virtual environment using the command for your system (Linux is used here) and install the required dependencies
```bash
source ./.venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

Install the required `npm` libraries
```bash
npm install
```

Copy the `.env-template` file to a new file called `.env`.
```bash
cp .env-template .env
```
You should add your TBA API key here. If you want to be able to send emails, fill out those variables as well

Next, create a django superuser and make and migrate the models
```bash
cd scouting
python manage.py createsuperuser
python manage.py makemigrations
python manage.py migrate
```

Now run the server using the following command, or run the `Start server` task in your Visual Studio Code
```bash
python manage.py runserver
```

Now, navigate to the `./admin` page (usually `http://127.0.0.1:8000/admin`), add view the `User` models. Find the superuser you just created, scroll down, and fill out all the fields for the profile object to prevent any errors

Additionally, you should start the Tailwind CSS builder with the following command, or use the `Build CSS` task in Visual Studio Code
```bash
npm run build:css
```

### Additional steps for Production installation
This depends on what server hosting provider you're using. However, there's a couple environment variables you need to set.

Set the following global environment variables (See the `.env-template` file for the complete list of needed environment variables):
- `DJANGO_ALLOWED_HOSTS` -> `${APP_DOMAIN}` (This works on DigitalOcean, this may not work on every hosting provider)
- `DJANGO_LOG_LEVEL` -> `WARNING`

- `SECRET_KEY` -> `<your new secret key>` (Generate this using `django.core.management.utils.get_random_secret_key()`. If possible you should encrypt this value in your hosting provider.)
- `DEBUG` -> `False`
- `DATABASE_URL` -> `${db.DATABASE_URL}` (This works on DigitalOcean, this may not work on every hosting provider)

Additionally, if you wish to show a custom message to the user on each page (demonstration server, currently undergoing maintenance), set the `SERVER_MESSAGE` environment variable to the message you wish to display.

If you wish to send emails with the server, set the following environment variables:
- `EMAIL_ENABLED` -> `True`
- `EMAIL_BACKEND` -> `django.core.mail.backends.smtp.EmailBackend`
- `EMAIL_HOST` -> `<your email host>`
- `EMAIL_HOST_USER` -> `<your email host username>`
- `EMAIL_HOST_PASSWORD` -> `<your email host password>`
- `EMAIL_PORT` -> `<your email host port>`
- `EMAIL_USE_TLS` -> `<True if your email host uses TLS>`

## Development
### djlint
This project uses `djlint` to lint the templates. You can run this using the following command
```bash
djlint scouting --reformat
```

### ruff
This project uses [`ruff`](https://docs.astral.sh/ruff/) to lint and format the python code.
You can run the following command to run the linter once
```bash
ruff check cardie --fix
```
For VS Code users, you can install the `ruff` extension to get linting and formatting on save.

## Contributing
Contributions are welcome to this project! Please see the [issues](https://github.com/nfoert/open-scouting/issues) page or the [roadmap](/docs/ROADMAP.md) for any current bugs or features that need implemented.

You can view the guide on how `season_fields.py` is formatted [here](/docs/Formatting_Season_Fields.md) if your contribution involves this file

When contributing, please fork this repository (ensure you uncheck the "Copy the `main` branch only" check box, this gives you access to the `development` branch with the latest changes)

Next, create a new branch and implement your changes. You can install this project locally for testing by following the steps in [Development Installation](#development-installation). Once you've made your changes, please open a pull request into the `development` branch, and your changes will be reviewed.

Eventually, `development` will be merged into `main` and your changes will be released into production with a new release. Thanks for your contribution!

## To-Do
Please see the [roadmap](/docs/ROADMAP.md) for the currently planned out things that need to be completed. Additionally, see the [issues page](https://github.com/nfoert/open-scouting/issues) for any current bugs or features that need implemented, but aren't officially scheduled.