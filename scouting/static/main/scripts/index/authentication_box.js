/**
 * Handles the client side code for the authentication box on the index page
 *
 * This checks with the server if the user is authenticated or not,
 * displays the current authentication status,
 * and handles the process of signing in without an account
 */

document.addEventListener("alpine:init", () => {
	Alpine.data("authentication_box", () => ({
		YEARS: YEARS,
		open: false,
		authenticated: false,
		username: "",
		display_name: "",
		team_number: "",

		/**
		 * Checks if the username and team number are filled in
		 */
		check() {
			if (this.$refs.username.value && this.$refs.team_number.value) {
				this.$refs.next.disabled = false;
			} else {
				this.$refs.next.disabled = true;
			}
		},

		/**
		 * Submits the username and team number to the server to start scouting,
		 * when continuing without an account
		 */
		submit() {
			username = this.$refs.username.value;
			team_number = this.$refs.team_number.value;

			window.dispatchEvent(
				new CustomEvent("header_username", {
					detail: { username, team_number },
				}),
			);

			const urlParams = new URLSearchParams(window.location.search);
			const year = urlParams.get("year");
			const event_name = urlParams.get("event_name");
			const event_code = urlParams.get("event_code");

			if (year && event_name && event_code) {
				window.dispatchEvent(
					new CustomEvent("header_year", {
						detail: { year },
					}),
				);

				window.dispatchEvent(
					new CustomEvent("header_event", {
						detail: { event_name, event_code },
					}),
				);

				window.dispatchEvent(
					new CustomEvent("scouting_notification", {
						detail: {
							title: "Event autofilled",
							body: "Autofilled the event and year from the provided link data",
							icon: "lightning",
						},
					}),
				);

				this.page = 4;
			} else {
				this.page = 2;
			}
		},

		/**
		 * Starts scouting in demo mode
		 */
		start_demo() {
			window.dispatchEvent(
				new CustomEvent("header_demo", {
					detail: { year: this.YEARS.at(-1) },
				}),
			);

			this.page = 4;
		},

		/**
		 * Opens the advanced data view
		 */
		advanced_data_view() {
			window.location.href = `${SERVER_IP}/advanced_data`;
		},

		/**
		 * Opens the authentication page
		 */
		sign_in() {
			window.location.href = `${SERVER_IP}/authentication`;
		},

		/**
		 * Continues scouting with an account, using the current authentication status
		 */
		continue_with_account() {
			username = this.username;
			team_number = this.team_number;

			window.dispatchEvent(
				new CustomEvent("header_username", {
					detail: { username, team_number },
				}),
			);

			const urlParams = new URLSearchParams(window.location.search);
			const year = urlParams.get("year");
			const event_name = urlParams.get("event_name");
			const event_code = urlParams.get("event_code");

			if (year && event_name && event_code) {
				window.dispatchEvent(
					new CustomEvent("header_year", {
						detail: { year },
					}),
				);

				window.dispatchEvent(
					new CustomEvent("header_event", {
						detail: { event_name, event_code },
					}),
				);

				window.dispatchEvent(
					new CustomEvent("scouting_notification", {
						detail: {
							title: "Event autofilled",
							body: "Autofilled the event and year from the provided link data",
							icon: "lightning",
						},
					}),
				);

				this.page = 4;
			} else {
				this.page = 2;
			}
		},

		/**
		 * Asks the server to sign the user out
		 */
		async sign_out() {
			const response = await fetch(`${SERVER_IP}/authentication/sign_out`, {
				method: "POST",
				headers: {
					"X-CSRFToken": CSRF_TOKEN,
				},
			});

			if (response.ok) {
				response.text().then(async (text) => {
					const auth_json = {
						authenticated: false,
						username: "",
						display_name: "",
						team_number: "",
					};

					localStorage.setItem("authenticated", JSON.stringify(auth_json));
					window.location.reload();
				});
			} else {
				console.log("Error signing out");
			}
		},

		/**
		 * Gets the current authentication status from the server
		 */
		async check_authentication_status() {
			if (globalThis.offline === false) {
				// Ask server for status
				const response = await fetch(
					`${SERVER_IP}/authentication/get_authentication_status`,
					{
						method: "POST",
						headers: {
							"X-CSRFToken": CSRF_TOKEN,
						},
					},
				);

				if (response.ok) {
					response.json().then(async (json) => {
						if (json.authenticated === true) {
							this.authenticated = true;
							const auth_json = {
								authenticated: json.authenticated,
								username: json.username,
								display_name: json.display_name,
								team_number: json.team_number,
							};

							this.username = json.username;
							this.display_name = json.display_name;
							this.team_number = json.team_number;
							localStorage.setItem("authenticated", JSON.stringify(auth_json));
						} else {
							this.authenticated = false;
							const auth_json = {
								authenticated: json.authenticated,
								username: json.username,
								display_name: json.display_name,
								team_number: json.team_number,
							};

							this.username = json.username;
							this.display_name = json.display_name;
							this.team_number = json.team_number;
							localStorage.setItem("authenticated", JSON.stringify(auth_json));
						}
					});
				} else {
					console.log("Error getting authentication status");
					this.authenticated = false;
					const auth_json = {
						authenticated: false,
						username: "",
						display_name: "",
						team_number: "",
					};
					localStorage.setItem("authenticated", JSON.stringify(auth_json));
				}
			} else {
				// Check local storage for status
				if (JSON.parse(localStorage.getItem("authenticated")).authenticated) {
					this.authenticated = true;
					this.username = JSON.parse(
						localStorage.getItem("authenticated"),
					).username;
					this.display_name = JSON.parse(
						localStorage.getItem("authenticated"),
					).display_name;
					this.team_number = JSON.parse(
						localStorage.getItem("authenticated"),
					).team_number;
				} else {
					this.authenticated = false;
				}
			}
		},

		init() {
			setTimeout(() => {
				this.check_authentication_status();
			}, 100);
		},
	}));
});
