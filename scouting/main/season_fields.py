crescendo = [
    {
        "section": "Main",
        "simple_name": "main",
        "fields": [
            {
                "name": "Team Number",
                "simple_name": "team_number",
                "type": "integer",
                "required": "true",
            },
            {
                "name": "Match Number",
                "simple_name": "match_number",
                "type": "integer",
                "required": "true",
            },
        ]
    },
    {
        "section": "Auton",
        "simple_name": "auton",
        "fields": [
            {
                "name": "Speaker Shot",
                "simple_name": "speaker_shot",
                "type": "choice",
                "choices": ["N/A", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
                "required": "false",
            },
            {
                "name": "Amp Shot",
                "simple_name": "amp_shot",
                "type": "choice",
                "choices": ["N/A", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
                "required": "false",
            },
        ]
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
                        "type": "choice",
                        "choices": ["N/A", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
                        "required": "false",
                    },
                    {
                        "name": "Speaker Misses",
                        "simple_name": "speaker_miss",
                        "type": "choice",
                        "choices": ["N/A", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
                        "required": "false",
                    },
                ]
            },
            {
                "section": "Amp",
                "simple_name": "teleop_amp",
                "fields": [
                    {
                        "name": "Amp Shots",
                        "simple_name": "amp_shot",
                        "type": "choice",
                        "choices": ["N/A", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
                        "required": "false",
                    },
                    {
                        "name": "Amp Misses",
                        "simple_name": "amp_miss",
                        "type": "choice",
                        "choices": ["N/A", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
                        "required": "false",
                    },
                ]
            },
        ]
    },
    {
        "section": "Extra Information",
        "simple_name": "extra_information",
        "fields": [
            {
                "name": "Left Starting Zone",
                "simple_name": "left_starting_zone",
                "type": "boolean",
                "required": "false",
            },
            {
                "name": "Shoot Distance",
                "simple_name": "shoot_distance",
                "type": "multiple_choice",
                "choices": ["N/A", "Close", "Mid Field", "Far"],
                "required": "false",
            },
            {
                "name": "Floor Pickup",
                "simple_name": "floor_pickup",
                "type": "boolean",
                "required": "false",
            },
            {
                "name": "Climb",
                "simple_name": "climb",
                "type": "boolean",
                "required": "false",
            },
            {
                "name": "Scored Trap",
                "simple_name": "scored_trap",
                "type": "boolean",
                "required": "false",
            },
            {
                "name": "Feeder Station Pickup",
                "simple_name": "feeder_station_pickup",
                "type": "boolean",
                "required": "false",
            },
            {
                "name": "Moved During Auto",
                "simple_name": "moved_during_auto",
                "type": "boolean",
                "required": "false",
            },
        ]
    },
]
