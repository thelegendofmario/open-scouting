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
			const openRequest = indexedDB.open("scouting_data", 4);

			openRequest.onupgradeneeded = (event) => {
				const db = event.target.result;
				db.createObjectStore("offline_reports", { keyPath: "uuid" });
				db.createObjectStore("backups", { keyPath: "uuid" });
				db.createObjectStore("offline_pit_scouting", { keyPath: "uuid" });
			};

			openRequest.onsuccess = (event) => {
				const db = event.target.result;

				const transaction = db.transaction(["backups"], "readwrite");
				const objectStore = transaction.objectStore("backups");

				const request = objectStore.count();

				request.onsuccess = (event) => {
					this.locally_backed_up_reports = event.target.result;
				};

				request.onerror = (event) => {
					console.log(
						`Error adding data to the database: ${event.target.errorCode}`,
					);
				};
			};

			openRequest.onerror = (event) => {
				console.log(`Error opening database: ${event.target.errorCode}`);
			};
		},

		/**
		 * Check to be sure reports have been backed up to the server
		 */
		async check_local_backup_reports() {
			const openRequest = indexedDB.open("scouting_data", 4);

			openRequest.onupgradeneeded = (event) => {
				const db = event.target.result;
				db.createObjectStore("offline_reports", { keyPath: "uuid" });
				db.createObjectStore("backups", { keyPath: "uuid" });
				db.createObjectStore("offline_pit_scouting", { keyPath: "uuid" });
			};

			openRequest.onsuccess = (event) => {
				const db = event.target.result;

				const transaction = db.transaction(["backups"], "readwrite");
				const objectStore = transaction.objectStore("backups");

				const request = objectStore.getAll();

				request.onsuccess = async (event) => {
					const reports = event.target.result;

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
				};

				request.onerror = (event) => {
					console.log(
						`Error adding data to the database: ${event.target.errorCode}`,
					);
				};
			};

			openRequest.onerror = (event) => {
				console.log(`Error opening database: ${event.target.errorCode}`);
			};
		},

		/**
		 * Delete all locally backed up reports
		 */
		clear_saved_backup_reports() {
			const openRequest = indexedDB.open("scouting_data", 4);

			openRequest.onupgradeneeded = (event) => {
				const db = event.target.result;
				db.createObjectStore("offline_reports", { keyPath: "uuid" });
				db.createObjectStore("backups", { keyPath: "uuid" });
				db.createObjectStore("offline_pit_scouting", { keyPath: "uuid" });
			};

			openRequest.onsuccess = (event) => {
				const db = event.target.result;

				const transaction = db.transaction(["backups"], "readwrite");
				const objectStore = transaction.objectStore("backups");

				const request = objectStore.clear();

				request.onsuccess = (event) => {
					this.locally_backed_up_reports = 0;
					this.backed_up_reports_confirm_delete = false;
				};

				request.onerror = (event) => {
					console.log(
						`Error adding data to the database: ${event.target.errorCode}`,
					);
				};
			};

			openRequest.onerror = (event) => {
				console.log(`Error opening database: ${event.target.errorCode}`);
			};
		},

		init() {
			this.get_local_backup_reports();
		},
	}));
});
