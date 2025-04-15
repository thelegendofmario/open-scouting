document.addEventListener("alpine:init", () => {
	Alpine.data("menu", () => ({
		open: false,
		offline: !navigator.onLine,
		notification_shown: false,
		notification: {
			title: "",
			body: "",
			icon: "",
			icon_class: "",
		},
		dark_mode: true,
		credits_open: false,
		developer_open: false,
		service_worker_cache_first: true,
		offline_manual: false,
		offline_manual_last: false,
		mrbc_open: false,
		offline_reports: false,
		offline_pit_scouting: false,

		/**
		 * Check if the user is offline or not, and store it in a global variable
		 *
		 * Also emits and event and notification when the user is newly online or offline
		 */
		offline_check() {
			if (this.offline_manual === true && this.offline_manual_last === true) {
				this.offline_manual_last = false;
				globalThis.offline = true;
				window.dispatchEvent(new CustomEvent("scouting_offline"));
				this.show_notification(
					"Device offline",
					"You're now offline. Some features will be reduced until you're back online.",
					"wifi-slash",
				);
			} else {
				if (this.offline_manual_last === true) {
					this.offline_manual_last = false;
					globalThis.offline = false;
					window.dispatchEvent(new CustomEvent("scouting_online"));
				}

				if (this.offline_manual === true) {
					globalThis.offline = true;
					window.dispatchEvent(new CustomEvent("scouting_offline"));
				}

				if (this.offline !== !navigator.onLine) {
					this.offline = !navigator.onLine;
					globalThis.offline = !navigator.onLine;

					if (this.offline) {
						globalThis.offline = true;
						window.dispatchEvent(new CustomEvent("scouting_offline"));
						this.show_notification(
							"Device offline",
							"You're now offline. Some features will be reduced until you're back online.",
							"wifi-slash",
						);
					} else {
						globalThis.offline = false;
						window.dispatchEvent(new CustomEvent("scouting_online"));
						this.show_notification(
							"Device online",
							"You're back online.",
							"wifi-high",
						);
					}
				}
			}
		},

		/**
		 * Show a notification across the application
		 *
		 * @param {string} title - The title of the notification
		 * @param {string} body - The body of the notification
		 * @param {string} icon - The icon of the notification (As a Phosphor icon, omit the 'ph-' part)
		 */
		show_notification(title, body, icon) {
			if (this.notification_shown) {
				this.hide_notification();
			}

			this.notification.title = title;
			this.notification.body = body;
			this.notification.icon = icon;
			this.notification.icon_class = `ph-bold ph-${icon}`;
			this.notification_shown = true;

			setTimeout(() => {
				this.hide_notification();
			}, 5000);
		},

		/**
		 * Hide the currently shown notification
		 */
		hide_notification() {
			this.notification_shown = false;
			this.notification.title = "";
			this.notification.body = "";
			this.notification.icon = "";
		},

		/**
		 * Set the document to dark mode or light mode
		 */
		update_dark_mode() {
			if (this.dark_mode) {
				document.documentElement.classList.add("dark");
				localStorage.setItem("theme", "dark");
			} else {
				document.documentElement.classList.remove("dark");
				localStorage.setItem("theme", "light");
			}
		},

		/**
		 * Toggle between dark and light mode
		 */
		toggle_dark_mode() {
			this.dark_mode = !this.dark_mode;
			this.update_dark_mode();
		},

		/**
		 * Clear the service worker cache
		 */
		async clear_service_worker_cache() {
			await caches.delete("v1");
		},

		/**
		 * Toggles the mode of the service worker from cache first to and network first
		 */
		async toggle_service_worker_mode() {
			this.service_worker_cache_first = !this.service_worker_cache_first;
			localStorage.setItem(
				"service_worker_cache_first",
				this.service_worker_cache_first,
			);
			await caches.delete("v1");

			location.reload();
		},

		/**
		 * Clear the IndexedDB database
		 */
		clear_database() {
			const openRequest = indexedDB.open("scouting_data", 4);

			openRequest.onsuccess = (event) => {
				const db = event.target.result;
				const transaction = db.transaction(
					["offline_reports", "backups", "offline_pit_scouting"],
					"readwrite",
				);

				const objectStore = transaction.objectStore("offline_reports");
				const clearReports = objectStore.clear();

				const objectStore2 = transaction.objectStore("backups");
				const clearBackups = objectStore2.clear();

				const objectStore3 = transaction.objectStore("offline_pit_scouting");
				const clearPitScouting = objectStore3.clear();

				clearReports.onsuccess = () => {
					clearBackups.onsuccess = () => {
						clearPitScouting.onsuccess = () => {
							log("INFO", "Deleted the contents of the object stores");
						};
					};
				};
			};
		},

		/**
		 * Toggles the offline mode manually
		 */
		toggle_offline_manual() {
			this.offline_manual = !this.offline_manual;
			this.offline_manual_last = true;
			localStorage.setItem("offline_manual", this.offline_manual);

			window.dispatchEvent(new CustomEvent("sw_update_offline_manual"));
		},

		/**
		 * Check if there's any offline reports that can be uploaded
		 */
		check_for_offline_reports() {
			if (globalThis.offline === false) {
				const openRequest = indexedDB.open("scouting_data", 4);

				openRequest.onupgradeneeded = (event) => {
					const db = event.target.result;
					db.createObjectStore("offline_reports", { keyPath: "uuid" });
					db.createObjectStore("backups", { keyPath: "uuid" });
					db.createObjectStore("offline_pit_scouting", { keyPath: "uuid" });
				};

				openRequest.onsuccess = (event) => {
					const db = event.target.result;

					const transaction = db.transaction(["offline_reports"], "readwrite");
					const objectStore = transaction.objectStore("offline_reports");

					request = objectStore.count();

					request.onsuccess = (event) => {
						if (event.target.result > 0) {
							this.offline_reports = true;
							this.show_notification(
								"Reports available to upload.",
								`You have ${event.target.result} reports that were saved offline ready to upload`,
								"cloud-arrow-up",
							);
						} else {
							this.offline_reports = false;
						}
					};

					request.onerror = (event) => {
						log(
							"WARNING",
							`Error adding data to the database: ${event.target.errorCode}`,
						);
					};
				};

				openRequest.onerror = (event) => {
					log("WARNING", `Error opening database: ${event.target.errorCode}`);
				};
			} else {
				this.offline_reports = false;
			}
		},

		/**
		 * Upload offline reports to the server
		 */
		upload_offline_reports() {
			const openRequest = indexedDB.open("scouting_data", 4);

			openRequest.onupgradeneeded = (event) => {
				const db = event.target.result;
				db.createObjectStore("offline_reports", { keyPath: "uuid" });
				db.createObjectStore("backups", { keyPath: "uuid" });
				db.createObjectStore("offline_pit_scouting", { keyPath: "uuid" });
			};

			openRequest.onsuccess = (event) => {
				const db = event.target.result;

				const transaction = db.transaction(["offline_reports"], "readwrite");
				const objectStore = transaction.objectStore("offline_reports");

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

					const response = await fetch(`${SERVER_IP}/upload_offline_reports`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"X-CSRFToken": CSRF_TOKEN,
						},
						body: JSON.stringify({
							data: encodeURIComponent(JSON.stringify(report_list)),
						}),
					});

					response.json().then(async (json) => {
						if (response.ok) {
							const transaction = db.transaction(
								["offline_reports"],
								"readwrite",
							);
							const objectStore = transaction.objectStore("offline_reports");
							const clear_request = objectStore.clear();

							clear_request.onsuccess = (event) => {
								this.offline_reports = false;
								this.show_notification(
									"Reports have been uploaded",
									"All your reports have been stored on the server",
									"check-circle",
								);
							};

							clear_request.onerror = (event) => {
								log("WARNING", "Error clearing the object store");
							};
						} else {
							log("WARNING", "There was an issue uploading scouting reports");
							this.show_notification(
								"There was an issue uploading scouting reports",
								"Your reports may have not been uploaded",
								"warning",
							);
						}
					});
				};

				request.onerror = (event) => {
					log(
						"WARNING",
						`Error adding data to the database: ${event.target.errorCode}`,
					);
				};
			};
		},

		/**
		 * Check for any offline pit scouting data that can be uploaded to the server
		 */
		check_for_offline_pit_scouting() {
			if (globalThis.offline === false) {
				const openRequest = indexedDB.open("scouting_data", 4);

				openRequest.onupgradeneeded = (event) => {
					const db = event.target.result;
					db.createObjectStore("offline_reports", { keyPath: "uuid" });
					db.createObjectStore("backups", { keyPath: "uuid" });
					db.createObjectStore("offline_pit_scouting", { keyPath: "uuid" });
				};

				openRequest.onsuccess = (event) => {
					const db = event.target.result;

					const transaction = db.transaction(
						["offline_pit_scouting"],
						"readwrite",
					);
					const objectStore = transaction.objectStore("offline_pit_scouting");

					request = objectStore.getAll();

					request.onsuccess = (event) => {
						let count = 0;
						for (const element of event.target.result) {
							if (element.uuid != "master_questions") {
								count++;
							}
						}

						if (count > 0) {
							this.offline_pit_scouting = true;
							this.show_notification(
								"Reports available to upload.",
								`You have ${count} pit scouting reports that were saved offline ready to upload`,
								"cloud-arrow-up",
							);
						} else {
							this.offline_pit_scouting = false;
						}
					};

					request.onerror = (event) => {
						log(
							"WARNING",
							`Error adding data to the database: ${event.target.errorCode}`,
						);
					};
				};

				openRequest.onerror = (event) => {
					log("WARNING", `Error opening database: ${event.target.errorCode}`);
				};
			} else {
				this.offline_pit_scouting = false;
			}
		},

		/**
		 * Upload offline pit scouting data to the server
		 */
		upload_offline_pit_scouting() {
			const openRequest = indexedDB.open("scouting_data", 4);

			openRequest.onupgradeneeded = (event) => {
				const db = event.target.result;
				db.createObjectStore("offline_reports", { keyPath: "uuid" });
				db.createObjectStore("backups", { keyPath: "uuid" });
				db.createObjectStore("offline_pit_scouting", { keyPath: "uuid" });
			};

			openRequest.onsuccess = (event) => {
				const db = event.target.result;

				const transaction = db.transaction(
					["offline_pit_scouting"],
					"readwrite",
				);
				const objectStore = transaction.objectStore("offline_pit_scouting");

				const request = objectStore.getAll();

				request.onsuccess = async (event) => {
					const reports = event.target.result;
					let upload_failed = false;

					for (report in reports) {
						// Ignore if it's not the master question list
						if (reports[report].uuid !== "master_questions") {
							const response = await fetch(`${SERVER_IP}/update_pits`, {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
									"X-CSRFToken": CSRF_TOKEN,
								},
								body: JSON.stringify({
									event_name: encodeURIComponent(reports[report].event_name),
									event_code: reports[report].event_code,
									custom: reports[report].custom,
									year: reports[report].year,
									data: JSON.parse(reports[report].data),
								}),
							});

							response.json().then(async (json) => {
								if (response.ok) {
									const transaction = db.transaction(
										["offline_pit_scouting"],
										"readwrite",
									);
									const objectStore = transaction.objectStore(
										"offline_pit_scouting",
									);
									const delete_request = objectStore.delete(
										`${reports[report].uuid}`,
									);

									delete_request.onsuccess = (event) => {
										this.offline_pit_scouting = false;
									};

									delete_request.onerror = (event) => {
										log("WARNING", "Error clearing the object store");
										upload_failed = true;
									};
								} else {
									log(
										"WARNING",
										"There was an issue uploading scouting reports",
									);
									upload_failed = true;
								}
							});

							if (upload_failed === true) {
								this.show_notification(
									"There was an issue uploading scouting reports",
									"Your reports may have not been uploaded",
									"warning",
								);
							} else {
								this.show_notification(
									"Pit scouting reports have been uploaded",
									"All your pit scouting reports have been stored on the server",
									"check-circle",
								);
							}
						}
					}
				};

				request.onerror = (event) => {
					log(
						"WARNING",
						`Error adding data to the database: ${event.target.errorCode}`,
					);
				};
			};
		},

		/**
		 * Initialize the menu
		 *
		 * Sets up dark mode, checks if the is offline, sets up the service worker,
		 * and checks if there's any offline reports that can be uploaded
		 */
		init() {
			if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
				this.dark_mode = true;
			} else {
				this.dark_mode = false;
			}

			this.update_dark_mode();

			this.service_worker_cache_first = JSON.parse(
				localStorage.getItem("service_worker_cache_first"),
			);
			this.offline_manual = JSON.parse(localStorage.getItem("offline_manual"));

			if (this.offline_manual == true) {
				this.offline_manual_last = true;
			}

			globalThis.offline = false;

			this.offline_check();

			// Check every half a second if the user is offline or not
			setInterval(() => {
				this.offline_check();
			}, 500);

			window.addEventListener("scouting_notification", (event) => {
				event.stopImmediatePropagation();
				const { title, body, icon } = event.detail;
				this.show_notification(title, body, icon);
			});

			this.check_for_offline_reports();
			this.check_for_offline_pit_scouting();

			window.addEventListener("scouting_online", (event) => {
				this.check_for_offline_reports();
				this.check_for_offline_pit_scouting();
			});

			// this.show_notification('Open Scouting', 'Welcome to Open Scouting!', 'star');
		},
	}));
});
