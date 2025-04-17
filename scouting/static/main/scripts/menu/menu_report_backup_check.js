document.addEventListener("alpine:init", () => {
	Alpine.data("menu_report_backup_check", () => ({
		locally_backed_up_reports: 0,
		backed_up_reports_checked: false,
		backed_up_reports_found: 0,
		backed_up_reports_not_found: 0,
		backed_up_reports_confirm_delete: false,

		/**
		 * Check the database for any reports that are backed up
		 */
		get_local_backup_reports() {
			const db = new Dexie("scouting_data");

			db.version(DATABASE_VERSION).stores({
				offline_reports: "++uuid, data, event_name, event_code, custom, year",
				backups: "++uuid",
				offline_pit_scouting: "++uuid",
			});

			db.backups
				.count()
				.then((count) => {
					this.locally_backed_up_reports = count;
				})
				.catch((error) => {
					log("WARNING", `Error counting offline reports: ${error}`);
				});
		},

		/**
		 * Check to be sure reports have been backed up to the server
		 */
		async check_local_backup_reports() {
			const db = new Dexie("scouting_data");

			db.version(DATABASE_VERSION).stores({
				offline_reports: "++uuid, data, event_name, event_code, custom, year",
				backups: "++uuid",
				offline_pit_scouting: "++uuid",
			});

			db.backups.toArray().then(async (reports) => {
				const report_list = [];

				for (report in reports) {
					const data = {
						uuid: reports[report].uuid,
						data: reports[report].data,
						event_name: reports[report].event_name,
						event_code: reports[report].event_code,
						custom: reports[report].custom,
						year: reports[report].year,
					};

					report_list.push(data);
				}

				const response = await fetch(
					`${SERVER_IP}/check_local_backup_reports`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"X-CSRFToken": CSRF_TOKEN,
						},
						body: JSON.stringify({
							data: encodeURIComponent(JSON.stringify(report_list)),
						}),
					},
				);

				response.json().then(async (json) => {
					if (response.ok) {
						data = JSON.parse(json);
						this.backed_up_reports_found = data.reports_found;
						this.backed_up_reports_not_found = data.reports_not_found;
						this.backed_up_reports_checked = true;
					}
				});
			});
		},

		/**
		 * Delete all locally backed up reports
		 */
		clear_saved_backup_reports() {
			const db = new Dexie("scouting_data");

			db.version(DATABASE_VERSION).stores({
				offline_reports: "++uuid, data, event_name, event_code, custom, year",
				backups: "++uuid",
				offline_pit_scouting: "++uuid",
			});

			db.backups
				.clear()
				.catch((error) => {
					log("WARNING", `Error clearing backup reports: ${error}`);
				})
				.finally(() => {
					this.locally_backed_up_reports = 0;
				});
		},

		init() {
			this.get_local_backup_reports();
		},
	}));
});
