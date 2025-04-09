/**
 * Handles the main functionality of the pit scouting page
 *
 * Pulls data from the server, syncs the data to the server, and stores the data locally
 */

document.addEventListener("alpine:init", () => {
	Alpine.data("pits", () => ({
		pit_data: [],
		pit_data_old: [],
		pit_data_filtered: [],
		filter: "all",
		pit_status: [],
		master_questions: [],
		state: "loading",

		/**
		 * Add an answer to a question to the local database
		 *
		 * @param {Event} event - The event object
		 * @param {string} simple_name - The simple name of the question
		 * @param {string} type - The type of the question
		 */
		submit_answer(event, simple_name, type) {
			const input = event.target
				.closest("div")
				.querySelector(".ui_input, .ui_checkbox");
			const team_number = event.target
				.closest(".pit_top")
				.getAttribute("team_number");

			const today = new Date();
			const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

			const pit_index = this.pit_data.findIndex(
				(obj) => obj.team_number === team_number,
			);
			const question_index = this.pit_data[pit_index].questions.findIndex(
				(obj) => obj.simple_name === simple_name,
			);

			const new_value = type === "boolean" ? input.checked : input.value;

			// Check if the answer already exists to prevent duplicates
			const existing_answer = this.pit_data[pit_index].questions[
				question_index
			].answers.find((ans) => ans.value === new_value && ans.user === USERNAME);

			if (!existing_answer) {
				this.pit_data[pit_index].questions[question_index].answers.push({
					value: new_value,
					user: USERNAME,
					contributed: date,
				});

				this.state = "unsaved";
			}
		},

		/**
		 * Add a question to the local database
		 *
		 * @param {Event} event - The event object
		 * @param {string} name - The name of the question
		 */
		submit_question(event, name) {
			const team_number = event.target
				.closest(".pit_top")
				.getAttribute("team_number");
			const simple_name = name.value
				.toLowerCase()
				.replace("?", "")
				.replace(" ", "_");
			const pit_index = this.pit_data.findIndex(
				(obj) => obj.team_number === team_number,
			);

			this.pit_data[pit_index].questions.push({
				text: name.value,
				simple_name: simple_name,
				type: "text",
				answers: [],
			});

			name.value = "";

			this.state = "unsaved";
		},

		/**
		 * Add a new team to the local database
		 *
		 * Uses The Blue Alliance to attempt to get the team's nickname
		 *
		 * @param {Event} event - The event object
		 * @param {string} team_number - The team number
		 */
		async submit_team(event, team_number) {
			if (globalThis.offline === false) {
				const response = await fetch(
					`https://www.thebluealliance.com/api/v3/team/frc${team_number.value}`,
					{
						method: "GET",
						headers: {
							"X-TBA-Auth-Key": TBA_API_KEY,
						},
					},
				);

				if (response.ok) {
					response
						.json()
						.then(async (json) => {
							this.pit_data.push({
								team_number: team_number.value,
								nickname: json.nickname,
								questions: this.master_questions,
							});
							team_number.value = "";
						})
						.catch((error) => {
							this.pit_data.push({
								team_number: team_number.value,
								nickname: " ",
								questions: this.master_questions,
							});
							team_number.value = "";
						});
				} else {
					this.pit_data.push({
						team_number: team_number.value,
						nickname: " ",
						questions: this.master_questions,
					});
					team_number.value = "";
				}
			} else {
				this.pit_data.push({
					team_number: team_number.value,
					nickname: " ",
					questions: this.master_questions,
				});
				team_number.value = "";
			}

			this.state = "unsaved";
		},

		/**
		 * Update the server with the local database's changes
		 */
		async update_pit_data() {
			if (JSON.stringify(this.pit_data) !== JSON.stringify(this.pit_data_old)) {
				if (globalThis.offline === false) {
					if (this.state !== "syncing") {
						const response = await fetch(`${SERVER_IP}/update_pits`, {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								"X-CSRFToken": CSRF_TOKEN,
							},
							body: JSON.stringify({
								event_name: encodeURIComponent(EVENT_NAME),
								event_code: EVENT_CODE,
								custom: CUSTOM,
								year: YEAR,
								data: this.pit_data,
							}),
						});

						await response.text().then(async (text) => {
							this.pit_data_old = JSON.parse(JSON.stringify(this.pit_data));

							this.remove_pit_data_locally();

							this.state = "saved";
						});
					}
				} else {
					this.store_pit_data_locally();
					this.state = "offline";
					this.pit_data_old = JSON.parse(JSON.stringify(this.pit_data));
				}
			} else {
				if (globalThis.offline == false) {
					this.state = "saved";
				} else {
					this.state = "offline";
				}
			}
		},

		/**
		 * Update the server with the local database's changes,
		 * then pull the latest changes from the server
		 */
		async sync_pit_data() {
			this.state = "syncing";

			if (!globalThis.offline) {
				try {
					// First, push the data to the server
					const response = await fetch(`${SERVER_IP}/update_pits`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"X-CSRFToken": CSRF_TOKEN,
						},
						body: JSON.stringify({
							event_name: encodeURIComponent(EVENT_NAME),
							event_code: EVENT_CODE,
							custom: CUSTOM,
							year: YEAR,
							data: this.pit_data,
						}),
					});

					if (!response.ok) throw new Error("Failed to update pits on server");

					// Then, fetch the updated data from the server
					const get_response = await fetch(`${SERVER_IP}/get_pits`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"X-CSRFToken": CSRF_TOKEN,
						},
						body: JSON.stringify({
							event_name: encodeURIComponent(EVENT_NAME),
							event_code: EVENT_CODE,
							custom: CUSTOM,
							year: YEAR,
						}),
					});

					if (!get_response.ok) throw new Error("Failed to fetch updated pits");

					const data = await get_response.json();

					// Update local state
					this.pit_data = data;
					this.pit_data_old = JSON.parse(JSON.stringify(data));

					this.filter_pit_data();
					this.get_pit_status();
					this.remove_pit_data_locally();

					this.state = "saved";
				} catch (error) {
					console.error("Sync Error:", error);
					this.state = "offline"; // Handle failure by marking offline
				}
			} else {
				this.store_pit_data_locally();
				this.state = "offline";
				this.pit_data_old = JSON.parse(JSON.stringify(this.pit_data));
			}
		},

		/**
		 * Locally store pit data for offline scouting
		 */
		store_pit_data_locally() {
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

				const urlParams = new URLSearchParams(window.location.search);
				const event_name = urlParams.get("event_name");
				const event_code = urlParams.get("event_code");
				const year = urlParams.get("year");
				const custom = urlParams.get("custom");

				const pit_scouting_backup = {
					uuid: `${event_code}_${year}`,
					data: JSON.stringify(this.pit_data),
					event_name: event_name,
					event_code: event_code,
					year: year,
					custom: custom,
				};

				const request = objectStore.put(pit_scouting_backup);

				request.onsuccess = (event) => {
					console.log("Data added to the database");
				};

				request.onerror = (event) => {
					console.log(
						`Error adding data to the database: ${event.target.errorCode}`,
					);
				};
			};
		},

		/**
		 * Store the master list of questions locally for adding teams while offline
		 */
		store_master_list_of_questions_locally() {
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

				const pit_scouting_backup = {
					uuid: "master_questions",
					data: JSON.stringify(this.master_questions),
					event_name: "",
					event_code: "",
					year: "",
					custom: "",
				};

				const request = objectStore.put(pit_scouting_backup);

				request.onsuccess = (event) => {
					console.log("Data added to the database");
				};

				request.onerror = (event) => {
					console.log(
						`Error adding data to the database: ${event.target.errorCode}`,
					);
				};
			};
		},

		/**
		 * Remove the locally stored pit data for this event and year
		 */
		remove_pit_data_locally() {
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

				const urlParams = new URLSearchParams(window.location.search);
				const event_name = urlParams.get("event_name");
				const event_code = urlParams.get("event_code");
				const year = urlParams.get("year");

				const request = objectStore.delete(`${event_code}_${year}`);

				request.onsuccess = (event) => {
					console.log("Data removed from the database");
				};

				request.onerror = (event) => {
					if (event.target.error.name === "DataError") {
						console.log(
							`Key not found in the database: ${event.target.errorCode}`,
						);
					} else {
						console.log(
							`Error removing data from the database: ${event.target.errorCode}`,
						);
					}
				};
			};
		},

		/**
		 * Filter the pit data based on the selected filter
		 */
		filter_pit_data() {
			// Determines what pits in the database are complete, incomplete, or have no data
			const completed = [];
			const incomplete = [];
			const no_data = [];

			for (const pit of this.pit_data) {
				const questions = pit.questions || []; // Default to empty array if undefined
				const totalQuestions = questions.length;
				let answeredQuestions = 0;

				for (const question of questions) {
					if ((question.answers || []).length > 0) {
						answeredQuestions++;
					}
				}

				if (answeredQuestions === 0) {
					no_data.push(pit);
				} else if (answeredQuestions === totalQuestions) {
					completed.push(pit);
				} else {
					incomplete.push(pit);
				}
			}

			if (this.filter === "completed") {
				this.pit_data_filtered = completed;
			} else if (this.filter === "incomplete") {
				this.pit_data_filtered = incomplete;
			} else if (this.filter === "no_data") {
				this.pit_data_filtered = no_data;
			} else if (this.filter === "all") {
				this.pit_data_filtered = this.pit_data;
			} else {
				this.pit_data_filtered = this.pit_data;
			}
		},

		/**
		 * Get the status of each pit in the local database,
		 * so scouts can quickly press buttons to go to a team
		 */
		get_pit_status() {
			// Creates a list of all the teams and their status to add buttons for the scout to scroll to
			const completed = [];
			const incomplete = [];
			const no_data = [];

			for (const pit of this.pit_data) {
				const questions = pit.questions || []; // Default to empty array if undefined
				const totalQuestions = questions.length;
				const answeredQuestions = questions.filter(
					(q) => (q.answers || []).length > 0,
				).length;

				if (answeredQuestions === 0) {
					no_data.push({ team_number: pit.team_number, status: "no_data" });
				} else if (answeredQuestions === totalQuestions) {
					completed.push({ team_number: pit.team_number, status: "completed" });
				} else {
					incomplete.push({
						team_number: pit.team_number,
						status: "incomplete",
					});
				}
			}

			const all = [...no_data, ...incomplete, ...completed];

			if (this.filter === "completed") {
				this.pit_status = completed;
			} else if (this.filter === "incomplete") {
				this.pit_status = incomplete;
			} else if (this.filter === "no_data") {
				this.pit_status = no_data;
			} else if (this.filter === "all") {
				this.pit_status = all;
			} else {
				this.pit_status = all;
			}
		},

		/**
		 * Scroll to a pit on the page
		 *
		 * @param {string} pit - The team number of the pit to scroll to
		 */
		scroll_to_pit(pit) {
			const pit_div = document.querySelector(`div[team_number='${pit}']`);
			pit_div.scrollIntoView({ behavior: "smooth" });
		},

		/**
		 * Scroll to the top of the page
		 */
		go_to_top() {
			window.scrollTo({ top: 0, behavior: "smooth" });
		},

		/**
		 * Initialize the pit scouting page
		 *
		 * If the user isn't offline, get the pit data and master list of questions and store them locally
		 *
		 * If the user is offline, attempt to get the pit data from the local database
		 *
		 * Also doesn't let the page be closed with unsaved changes
		 */
		init() {
			// Delay by 100ms to make sure globalThis.offline is defined by menu
			setTimeout(async () => {
				if (globalThis.offline === false) {
					// The user is online, so fetch things from the server
					const get_pits_response = await fetch(`${SERVER_IP}/get_pits`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"X-CSRFToken": CSRF_TOKEN,
						},
						body: JSON.stringify({
							event_name: encodeURIComponent(EVENT_NAME),
							event_code: EVENT_CODE,
							custom: CUSTOM,
							year: YEAR,
						}),
					});

					get_pits_response.text().then(async (text) => {
						this.pit_data = JSON.parse(text);
						this.pit_data_old = JSON.parse(text);

						this.filter_pit_data();
						this.get_pit_status();

						this.update_pit_data();

						setInterval(() => {
							this.update_pit_data();
						}, 5000);
					});

					const get_pit_questions_response = await fetch(
						`${SERVER_IP}/get_pit_questions`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								"X-CSRFToken": CSRF_TOKEN,
							},
							body: JSON.stringify({
								year: YEAR,
							}),
						},
					);

					get_pit_questions_response.text().then(async (text) => {
						this.master_questions = JSON.parse(text);
						this.store_master_list_of_questions_locally();
					});
				} else {
					// The user is offline, so try and fetch things from the local database
					// First, try and get the pit data locally

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

						const urlParams = new URLSearchParams(window.location.search);
						const event_name = urlParams.get("event_name");
						const event_code = urlParams.get("event_code");
						const year = urlParams.get("year");

						const request = objectStore.get(`${event_code}_${year}`);

						request.onsuccess = async (event) => {
							const data = event.target.result;

							if (data) {
								this.pit_data = JSON.parse(data.data);
								this.pit_data_old = JSON.parse(data.data);

								this.filter_pit_data();
								this.get_pit_status();

								this.update_pit_data();

								setInterval(() => {
									this.update_pit_data();
								}, 5000);
							} else {
								this.pit_data = [];
								this.pit_data_old = [];

								this.filter_pit_data();
								this.get_pit_status();

								this.update_pit_data();

								setInterval(() => {
									this.update_pit_data();
								}, 5000);

								window.dispatchEvent(
									new CustomEvent("scouting_notification", {
										detail: {
											title: "No local pit scouting data found for this event",
											body: "Set up locally with blank data",
											icon: "warning",
										},
									}),
								);
							}
						};

						request.onerror = (event) => {
							console.log(
								`Error getting data from the database: ${event.target.errorCode}`,
							);
						};

						const master_questions_request =
							objectStore.get("master_questions");

						master_questions_request.onsuccess = async (event) => {
							const data = event.target.result;

							if (data) {
								this.master_questions = JSON.parse(data.data);
							} else {
								this.master_questions = [];
							}
						};

						master_questions_request.onerror = (event) => {
							console.log(
								`Error getting data from the database: ${event.target.errorCode}`,
							);
						};
					};

					openRequest.onerror = (event) => {
						console.log(`Error opening database: ${event.target.errorCode}`);
					};
				}
			}, 100);

			window.addEventListener("beforeunload", (event) => {
				if (this.state !== "saved") {
					event.preventDefault();
					event.returnValue = "";
					return "";
				}
			});
		},
	}));
});
