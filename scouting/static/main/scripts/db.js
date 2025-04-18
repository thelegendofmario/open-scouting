/**
 * Handles the connection to the database
 *
 * Any database migration or upgrades should be handled here
 */

const db = new Dexie("scouting_data");

//
// Resets the database due to breaking changes
//
// TOOD: This should be removed in the future, and if the user is having issues
// they should clear their browser data or use the button in the menu
async function init_db() {
	if (!localStorage.getItem("db_reset_v4")) {
		// The database has not been reset
		await db.delete().then(() => {
			localStorage.setItem("db_reset_v4", "true");
			log(
				"INFO",
				"The database has been reset due to breaking client side changes. This won't happen again.",
			);
			window.location.reload();
		});
	}

	db.version(1).stores({
		offline_reports: "++uuid, data, event_name, event_code, custom, year",
		backups: "++uuid",
		pit_scouting:
			"&uuid, event_name, event_code, year, team_number, nickname, needs_synced, questions",
	});

	await db.open();
}

init_db();
