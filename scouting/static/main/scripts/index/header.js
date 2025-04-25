document.addEventListener("alpine:init", () => {
	Alpine.data("header", () => ({
		basic: true,
		username: "",
		team_number: "",
		event_name: "",
		event_code: "",
		custom_event: false,
		year: "",
		demo: false,

		start_over() {
			window.dispatchEvent(new CustomEvent("start_over"));
			this.basic = true;
			this.username = "";
			this.team_number = "";
			this.event_name = "";
			this.event_code = "";
			this.year = "";
			this.demo = false;
		},

		init() {
			window.addEventListener("header_username", (event) => {
				event.stopImmediatePropagation();
				const { username, team_number } = event.detail;
				this.username = username;
				this.team_number = team_number;

				this.basic = false;
			});

			window.addEventListener("header_event", (event) => {
				event.stopImmediatePropagation();
				const { event_name, event_code } = event.detail;

				this.event_name = event_name;
				this.event_code = event_code;
			});

			window.addEventListener("header_year", (event) => {
				const { year } = event.detail;
				this.year = year;
			});

			window.addEventListener("header_custom_event", (event) => {
				event.stopImmediatePropagation();
				const { event_name, event_code } = event.detail;

				this.event_name = event_name;
				this.event_code = event_code;
				this.custom_event = true;
			});

			window.addEventListener("header_demo", (event) => {
				event.stopImmediatePropagation();
				const { year } = event.detail;

				this.basic = false;

				this.year = year;
				this.demo = true;
				this.username = "demo";
				this.team_number = "0000";
				this.event_name = "";
				this.event_code = "";
				this.custom_event = false;
			});

			window.addEventListener("get_header_data", (event) => {
				event.stopImmediatePropagation();
				const { load_page } = event.detail;

				let username = this.username;
				let team_number = this.team_number;
				let event_name = this.event_name;
				let event_code = this.event_code;
				let load_page_var = load_page;
				let custom = this.custom_event;
				let year = this.year;
				let demo = this.demo;

				window.dispatchEvent(
					new CustomEvent("header_data", {
						detail: {
							username,
							team_number,
							event_name,
							event_code,
							load_page,
							custom,
							year,
							demo,
						},
					}),
				);
			});

			window.addEventListener("get_link_data", (event) => {
				event.stopImmediatePropagation();

				let username = this.username;
				let team_number = this.team_number;
				let event_name = this.event_name;
				let event_code = this.event_code;
				let custom = this.custom_event;
				let year = this.year;
				let demo = this.demo;

				window.dispatchEvent(
					new CustomEvent("link_data", {
						detail: {
							username,
							team_number,
							event_name,
							event_code,
							custom,
							year,
							demo,
						},
					}),
				);
			});
		},
	}));
});
