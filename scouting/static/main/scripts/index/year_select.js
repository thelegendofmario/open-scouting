document.addEventListener("alpine:init", () => {
	Alpine.data("year_select", () => ({
		YEARS: YEARS.reverse(),
		selected_year: new Date().getFullYear(),
		number_of_events: 0,

		update_selected_year() {
			this.selected_year = this.$refs.year.value;
			this.get_year_data();
		},

		async get_year_data() {
			const response = await fetch(`${SERVER_IP}/get_year_data`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-CSRFToken": CSRF_TOKEN,
				},
				body: JSON.stringify({
					year: this.selected_year,
				}),
			});

			const year_data = JSON.parse(await response.json());
			this.number_of_events = year_data["events"];
		},

		next() {
			this.selected_year = this.$refs.year.value;

			window.dispatchEvent(
				new CustomEvent("header_year", {
					detail: { year: this.selected_year },
				}),
			);
			this.page = 3;
		},

		init() {
			setTimeout(() => {
				this.selected_year = this.$refs.year.value;

				this.get_year_data();
			}, 100);
		},
	}));
});
