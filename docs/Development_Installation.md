# Development Installation
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
pip install -r scouting/requirements.txt
pip install -r scouting/requirements-dev.txt
```

Install the required `npm` libraries
```bash
npm install
```

Copy the `.env-template` file to a new file called `.env`.
```bash
cp .env.development.template .env.development
```
You should add your TBA API key here. If you want to be able to send emails, fill out those environment variables as well

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