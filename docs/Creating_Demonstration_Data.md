# Creating Demonstration Data

This document describes the process that should be followed when adding demonstration data for a new season. This data will be shown on the `/data` page when Open Scouting is placed into demo mode

## Create the data
- Create a new custom event on the index page using the UI in a development instance (For organization's sake)
- Contribute example scouting reports to this custom event. Try to make the data as complete as possible, add notes, proper team numbers and match numbers, ect.
- You should make at least 6 reports (one full competition match)

## Add data to `demo_data.py`
- Create a new list in `demo_data.py` with the name of the new season
- Navigate to the `/admin` page of the development instance and click on the page for the newly created data
- Copy the `data` field and paste it into the new list inside `demo_data.py`. Fix the `true` and `false` values to read `True` and `False` to match Python dictionaries
- Repeat for the amount of data you created

Your demonstration data is now complete! Ensure that you've updated the new season year inside `views.py` and `models.py` as well