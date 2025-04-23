/**
 * Handles the main functionality of the pit scouting page
 *
 * Pulls data from the server, syncs the data to the server, and stores the data locally
 */

document.addEventListener("alpine:init", () => {
	Alpine.data("pits", () => ({
		filter: "all",
		pit_status: [],
		state: "loading",

		/**
		 * Add an answer to a question to the local database
		 *
		 * @param {Event} event - The event object
		 * @param {string} simple_name - The simple name of the question
		 * @param {string} type - The type of the question
		 */
		submit_answer(event, simple_name, type) {
			// TODO: Fix for new pit scouting system
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
			// TODO: Fix for new pit scouting system
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
			// TODO: Fix for new pit scouting system
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
		 * Store the master list of questions locally for adding teams while offline
		 */
		store_master_list_of_questions_locally(questions) {
			db.pit_scouting
				.put({
					uuid: "master_questions",
					data: JSON.stringify(questions),
					event_name: "",
					event_code: "",
					year: "",
					custom: "",
				})
				.then(() => {
					log("INFO", "Master questions added to the database");
				})
				.catch((error) => {
					log("WARNING", `Error adding data to the database: ${error}`);
				});
		},

		/**
		 * Get the status of each pit in the local database,
		 * so scouts can quickly press buttons to go to a team
		 */
		get_pit_status() {
			// Creates a list of all the teams and their status to add buttons for the scout to scroll to
			// TODO: Fix for new pit scouting system
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
		 * Store pit data from server into the local database
		 */
		setup_pit_data(pit_data) {
			for (const pit in pit_data.pits) {
				db.pit_scouting.put({
					uuid: pit.uuid,
					event_name: pit_data.event_name,
					event_code: pit_data.event_code,
					year: pit_data.year,
					team_number: pit.team_number,
					nickname: pit.nickname,
					needs_synced: false,
					questions: pit.questions,
				});
			}
		},

		/**
		 * Sync the pit data by saving the local database to the server
		 * and then retrieving the data from the server
		 */
		sync_pit_data() {
			// TODO: Implement syncing
		},

		/**
		 * Initialize the pit scouting page
		 *
		 * If the user isn't offline, get the pit data and master list of questions and store them locally
		 *
		 * If the user is offline, don't do anything
		 *
		 * Start the syncing process
		 *
		 * Also doesn't let the page be closed with unsaved changes
		 */
		init() {
			// Delay by 100ms to make sure globalThis.offline is defined by menu
			setTimeout(async () => {
				if (globalThis.offline === false) {
					// Get pit data and master list of questions from server, and save in IndexedDB

					const urlParams = new URLSearchParams(window.location.search);
					const event_name = urlParams.get("event_name");
					const event_code = urlParams.get("event_code");
					const year = urlParams.get("year");
					const custom = urlParams.get("custom");

					this.state = "loading";

					const pits_response = await fetch(`${SERVER_IP}/get_pits`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"X-CSRFToken": CSRF_TOKEN,
						},
						body: JSON.stringify({
							event_name: event_name,
							event_code: event_code,
							year: year,
							custom: custom,
						}),
					});

					if (pits_response.ok) {
						this.setup_pit_data(await pits_response.json());
					}

					const master_list_of_questions_response = await fetch(
						`${SERVER_IP}/get_pit_questions`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								"X-CSRFToken": CSRF_TOKEN,
							},
						},
					);

					if (master_list_of_questions_response.ok) {
						this.store_master_list_of_questions_locally(
							await master_list_of_questions_response.json(),
						);
					}
				}

				setInterval(() => {
					this.sync_pit_data();
				}, 10000);
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
