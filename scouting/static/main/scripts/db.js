/**
 * Handles the connection to the database
 *
 * Any database migration or upgrades should be handled here
 */

DATABASE_VERSION = 4;

const db = new Dexie("scouting_data");

db.version(DATABASE_VERSION).stores({
	offline_reports: "++uuid, data, event_name, event_code, custom, year",
	backups: "++uuid",
	offline_pit_scouting: "++uuid",
});
