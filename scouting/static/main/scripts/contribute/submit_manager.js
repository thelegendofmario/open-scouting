/**
 * Handles the submit button on the contribute page
 *
 * Checks to be sure all required fields are filled out, builds the JSON data to send to the server,
 * and uploads the scouting report the server
 *
 * If the user is offline, stores the scouting report locally
 */

document.addEventListener("alpine:init", () => {
	Alpine.data("submit_manager", () => ({
		missing_required_fields: false,

		/**
		 * Check fields for any missing required fields
		 *
		 * @returns {boolean} True if all required fields are filled out
		 */
		check_fields() {
			const all_fields = document.querySelectorAll("input");
			let missing_field_found = false;

			for (const field of all_fields) {
				if (
					field.getAttribute("scouting_required") === "true" &&
					field.value === ""
				) {
					field.classList.add("field_missing");
					missing_field_found = true;
				} else {
					field.classList.remove("field_missing");
				}
			}

			this.missing_required_fields = missing_field_found;

			if (missing_field_found) {
				return false;
			} else {
				return true;
			}
		},

		/**
		 * Creates the JSON data of the scouting match data to send to the server or store locally
		 *
		 * @returns {Object} The JSON data
		 */
		create_json_data() {
			const data = [];

			const all_inputs = document.querySelectorAll("input");
			const all_selects = document.querySelectorAll("select");
			const other_fields = document.querySelectorAll(".field_other");

			for (const field of all_inputs) {
				let value;
				if (field.value) {
					if (
						field.getAttribute("scouting_type") === "large_integer" ||
						field.getAttribute("scouting_type") === "text"
					) {
						value = field.value;
					} else if (field.getAttribute("scouting_type") === "boolean") {
						value = field.checked;
					}

					const data_field = {
						name: field.getAttribute("x-ref"),
						type: field.getAttribute("scouting_type"),
						value: value,
						stat_type: field.getAttribute("scouting_stat_type"),
						game_piece: field.getAttribute("scouting_game_piece"),
					};

					data.push(data_field);
				}
			}

			for (const field of all_selects) {
				let value;
				if (field.value) {
					if (
						field.getAttribute("scouting_type") === "choice" ||
						field.getAttribute("scouting_type") === "multiple_choice"
					) {
						value = field.value;
					}

					const data_field = {
						name: field.getAttribute("x-ref"),
						type: field.getAttribute("scouting_type"),
						value: value,
						stat_type: field.getAttribute("scouting_stat_type"),
						game_piece: field.getAttribute("scouting_game_piece"),
					};

					data.push(data_field);
				}
			}

			for (const field of other_fields) {
				let value;
				if (field.value) {
					if (field.getAttribute("scouting_type") === "integer") {
						value = field.value;
					}

					const data_field = {
						name: field.getAttribute("x-ref"),
						type: field.getAttribute("scouting_type"),
						value: value,
						stat_type: field.getAttribute("scouting_stat_type"),
						game_piece: field.getAttribute("scouting_game_piece"),
					};

					data.push(data_field);
				} else {
					const data_field = {
						name: field.getAttribute("x-ref"),
						type: field.getAttribute("scouting_type"),
						value: 0,
						stat_type: field.getAttribute("scouting_stat_type"),
						game_piece: field.getAttribute("scouting_game_piece"),
					};

					data.push(data_field);
				}
			}

			return data;
		},

		/**
		 * Either sends the scouting report to the server or stores it locally if the user is offline
		 *
		 * Additionally, doesn't do anything if the user is in demo mode and correctly
		 * sets up the url parameters for the status and next match number
		 */
		async submit_button() {
			try {
				var demo_param = JSON.parse(
					new URL(window.location.href).searchParams.get("demo").toLowerCase(),
				);
			} catch {
				var demo_param = false;
			}

			const match_number = document.querySelector(
				"input[name='match_number']",
			).value;
			const type = document.querySelector("select[name='match_type']").value;

			if (!demo_param) {
				if (this.check_fields()) {
					const report_uuid = crypto.randomUUID();

					db.open()
						.then(() => {
							const report_backup = {
								uuid: report_uuid,
								data: this.create_json_data(),
								event_name: encodeURIComponent(EVENT_NAME),
								event_code: EVENT_CODE,
								custom: CUSTOM,
								year: YEAR,
							};

							db.backups
								.add(report_backup)
								.then(() => {
									log("INFO", "Data added to the database");
								})
								.catch((error) => {
									log("WARNING", `Error adding data to the database: ${error}`);
								});
						})
						.catch((error) => {
							log("WARNING", `Error opening database: ${error}`);
						});

					if (globalThis.offline === false) {
						const response = await fetch(`${SERVER_IP}/submit`, {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								"X-CSRFToken": CSRF_TOKEN,
							},
							body: JSON.stringify({
								uuid: report_uuid,
								data: JSON.stringify(this.create_json_data()),
								event_name: encodeURIComponent(EVENT_NAME),
								event_code: EVENT_CODE,
								custom: CUSTOM,
								year: YEAR,
							}),
						});

						response.text().then(async (text) => {
							const url = new URL(window.location.href);

							url.searchParams.set("submitted", true);
							url.searchParams.delete("submitted_offline");
							url.searchParams.delete("submitted_demo");

							url.searchParams.set(
								"match_number",
								Number.parseInt(match_number, 10) + 1,
							);
							url.searchParams.set("match_type", encodeURIComponent(type));

							window.location.href = url.toString();
						});
					} else {
						log("INFO", "You're offline, report will be saved offline.");

						db.offline_reports
							.put({
								uuid: report_uuid,
								data: this.create_json_data(),
								event_name: encodeURIComponent(EVENT_NAME),
								event_code: EVENT_CODE,
								custom: CUSTOM,
								year: YEAR,
							})
							.then(() => {
								log("INFO", "Data added to the database");

								const url = new URL(window.location.href);

								url.searchParams.set("submitted_offline", true);
								url.searchParams.delete("submitted");
								url.searchParams.delete("submitted_demo");

								url.searchParams.set(
									"match_number",
									Number.parseInt(match_number, 10) + 1,
								);
								url.searchParams.set("match_type", encodeURIComponent(type));

								window.location.href = url.toString();
							})
							.catch((error) => {
								log("WARNING", `Error adding data to the database: ${error}`);
							});
					}
				}
			} else {
				log("INFO", "Submitted in demo mode");

				const url = new URL(window.location.href);

				url.searchParams.set("submitted_demo", true);
				url.searchParams.delete("submitted");
				url.searchParams.delete("submitted_offline");

				url.searchParams.set(
					"match_number",
					Number.parseInt(match_number, 10) + 1,
				);
				url.searchParams.set("match_type", encodeURIComponent(type));

				window.location.href = url.toString();
			}
		},

		/**
		 * Initializes the submit manager component
		 *
		 * Prevents the device from sleeping while on this page
		 */
		async init() {
			if ("wakeLock" in navigator) {
				try {
					this.wakeLock = await navigator.wakeLock.request("screen");
					log("DEBUG", "Wake lock acquired");
				} catch (err) {
					log("WARNING", `${err.name}, ${err.message}`);
				}
			} else {
				log("WARNING", "Wake lock not supported");
			}
		},
	}));
});
