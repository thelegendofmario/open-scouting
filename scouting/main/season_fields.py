# 2024
crescendo = [
    {
        "section": "Main",
        "simple_name": "main",
        "fields": [
            {
                "name": "Team Number",
                "simple_name": "team_number",
                "type": "large_integer",
                "required": True,
            },
            {
                "name": "Match Number",
                "simple_name": "match_number",
                "type": "large_integer",
                "required": True,
            },
        ],
    },
    {
        "section": "Auton",
        "simple_name": "auton",
        "fields": [
            {
                "name": "Speaker Shot",
                "simple_name": "speaker_shot",
                "type": "integer",
                "default": 0,
                "minimum": 0,
                "maximum": 30,
                "required": False,
            },
            {
                "name": "Amp Shot",
                "simple_name": "amp_shot",
                "type": "integer",
                "default": 0,
                "minimum": 0,
                "maximum": 30,
                "required": False,
            },
        ],
    },
    {
        "section": "Teleop",
        "simple_name": "teleop",
        "fields": [
            {
                "section": "Speaker",
                "simple_name": "teleop_speaker",
                "fields": [
                    {
                        "name": "Speaker Shot",
                        "simple_name": "speaker_shot",
                        "type": "integer",
                        "default": 0,
                        "minimum": 0,
                        "maximum": 30,
                        "required": False,
                    },
                    {
                        "name": "Speaker Misses",
                        "simple_name": "speaker_miss",
                        "type": "integer",
                        "default": 0,
                        "minimum": 0,
                        "maximum": 30,
                        "required": False,
                    },
                ],
            },
            {
                "section": "Amp",
                "simple_name": "teleop_amp",
                "fields": [
                    {
                        "name": "Amp Shots",
                        "simple_name": "amp_shot",
                        "type": "integer",
                        "default": 0,
                        "minimum": 0,
                        "maximum": 30,
                        "required": False,
                    },
                    {
                        "name": "Amp Misses",
                        "simple_name": "amp_miss",
                        "type": "integer",
                        "default": 0,
                        "minimum": 0,
                        "maximum": 30,
                        "required": False,
                    },
                ],
            },
        ],
    },
    {
        "section": "Extra Information",
        "simple_name": "extra_information",
        "fields": [
            {
                "name": "Left Starting Zone",
                "simple_name": "left_starting_zone",
                "type": "boolean",
                "required": False,
            },
            {
                "name": "Shoot Distance",
                "simple_name": "shoot_distance",
                "type": "multiple_choice",
                "choices": ["N/A", "Close", "Mid Field", "Far"],
                "required": False,
            },
            {
                "name": "Floor Pickup",
                "simple_name": "floor_pickup",
                "type": "boolean",
                "required": False,
            },
            {
                "name": "Climb",
                "simple_name": "climb",
                "type": "boolean",
                "required": False,
            },
            {
                "name": "Scored Trap",
                "simple_name": "scored_trap",
                "type": "boolean",
                "required": False,
            },
            {
                "name": "Feeder Station Pickup",
                "simple_name": "feeder_station_pickup",
                "type": "boolean",
                "required": False,
            },
            {
                "name": "Moved During Auto",
                "simple_name": "moved_during_auto",
                "type": "boolean",
                "required": False,
            },
        ],
    },
    {
        "section": "Additional Notes",
        "simple_name": "additional_notes",
        "fields": [
            {
                "name": "Additional Notes or Comments",
                "simple_name": "notes",
                "type": "text",
                "required": False,
            },
        ],
    },
]
