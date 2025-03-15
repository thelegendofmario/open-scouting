<div align="center">

  ![Open Scouting logo](repo/images/icon.png)

  <h1>Open Scouting</h1>

  **An open source application for easier scouting at First Robotics competitions**

  **[Live Server](https://206.189.255.232/) ● [Releases](https://github.com/FRC-Team3484/open-scouting/releases) ● [Issues](https://github.com/FRC-Team3484/open-scouting/issues) ● [Development branch](https://github.com/FRC-Team3484/open-scouting/tree/development)**

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
- View all data from an event in a table
- Have a system for quickly setting up all the required data entries for a new season
  - Have fields to quickly set up and provide to the user when scouting, e.g. "text", "boolean", "data" ect.
- Allow other teams to view and contribute data to the same server
- Create custom events if events aren't listed on TBA
- Keep backups of scouting reports locally
- Dark/light mode theme support
- Manually go offline in case of bad connection
- Scout team's pits at competition
- View and filter data for multiple teams at multiple events and filter that data by a specific recorded stat

## Installation
The installation and deployment process uses docker for simplicity.
### Development
Follow the steps in [Development Installation](./docs/Development_Installation.md) for how to get Open Scouting up and running locally for development or contributing

### Production
First, ensure you have `docker`, `docker-compose`, and `git` installed on your system

> [!NOTE]
> The included build files assumes that the db data is located at `/mnt/db/postgres` for the db and `/mnt/db/backups` for database backups. Change these values in `docker-compose.yml` to adjust the database location

Next, clone this repository
```bash
git clone https://github.com/FRC-Team3484/open-scouting
cd open-scouting
```

Now, copy `.env-template` to a new file called `.env`
```bash
cp .env.production.template .env.production
```

You'll want to change several of these variables in `.env`
- **`DEBUG`** - `False`
- **`SECRET_KEY`** - Generate your secret key using `django.core.management.utils.get_random_secret_key()`
- **`ADMIN_PATH`** - Change this to a random string or something specific that only you would know, protects the admin page from attacks
- **`TBA_API_KEY`** - Replace with your TBA API key, generated [here](https://www.thebluealliance.com/account)
- **`SERVER_IP`** - Replace with the IP address and port that the server will be accessed at
- **`CSRF_TRUSTED_ORIGINS`** - Replace with a list containing the IP address that the server will be hosted on

- **`POSTGRES_PASSWORD`** - Replace with a password for the postgres database, this should be long and hard to guess
  
The following variables are for the superuser that is created when the server starts for the first time, this is the main administrator account that is used to access the `/admin` page.
- **`DJANGO_SUPERUSER_USERNAME`** - Replace with your superuser's username (Make this equal to your email if you want to use this account inside of Open Scouting for contributing)
- **`DJANGO_SUPERUSER_PASSWORD`** - Replace with your superuser's password
- **`DJANGO_SUPERUSER_EMAIL`** - Replace with your superuser's email

Additionally, you should configure the environment variables for setting up emails

> [!NOTE]
> If you're having issues with pip being able to resolve the DNS name, you may need to restart your docker daemon using `sudo systemctl restart docker`

Finally, building and running the server is as simple as running the following
```bash
docker compose up --build -d
```

Subsequent starts should be run using
```bash
docker compose up -d
```

The server should now be working!

You should navigate to the `/admin` page (or whatever your admin path is) and access your new superuser, and fill in some values for the `Profile` object to prevent any errors when attempting to use this account

#### Backups
If you'd like to enable backups on your sever, use a cron job to do so
```bash
crontab -e # Select the first option
```

Add these lines into the editor that opens
```bash
0 2 * * * docker exec -t postgres pg_dump -U postgres -F c -f /backups/db_backup_$(date +\%F).dump mydatabase
0 3 * * * find /mnt/db/backups -type f -name "db_backup_*.dump" -mtime +7 -exec rm {} \;
```

## Contributing
Contributions are welcome to this project! Please see the [issues](https://github.com/FRC-Team3484/open-scouting/issues) page or the [roadmap](/docs/ROADMAP.md) for any current bugs or features that need implemented.

You can view the guide on how `season_fields.py` is formatted [here](/docs/Formatting_Season_Fields.md) if your contribution involves this file

When contributing, please fork this repository (ensure you uncheck the "Copy the `main` branch only" check box, this gives you access to the `development` branch with the latest changes)

Next, create a new branch and implement your changes. You can install this project locally for testing by following the steps in [Development Installation](#development-installation). Once you've made your changes, please open a pull request into the `development` branch, and your changes will be reviewed.

Eventually, `development` will be merged into `main` and your changes will be released into production with a new release. Thanks for your contribution!

## To-Do
Please see the [roadmap](/docs/ROADMAP.md) for the currently planned out things that need to be completed. Additionally, see the [issues page](https://github.com/FRC-Team3484/open-scouting/issues) for any current bugs or features that need implemented, but aren't officially scheduled.