document.addEventListener("alpine:init", () => {
	Alpine.data("events", () => ({
		events: [],
		custom_events: [],
		filtered_events: [],
		custom_filtered_events: [],
		no_events: true,
		no_custom_events: true,
		show_custom_events: false,
		year: new Date().getFullYear(),

		async get_events() {
			const get_events_request = await fetch(
				`https://www.thebluealliance.com/api/v3/events/${this.year}`,
				{
					method: "GET",
					headers: {
						"X-TBA-Auth-Key": TBA_API_KEY,
					},
				},
			);

			const data = await get_events_request.json();
			this.events = data;
			this.update_filters();

			const get_custom_events_request = await fetch(
				`${SERVER_IP}/get_custom_events`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"X-CSRFToken": CSRF_TOKEN,
					},
					body: JSON.stringify({
						year: this.year,
					}),
				},
			);

			const custom_data = JSON.parse(await get_custom_events_request.json());
			this.custom_events = custom_data;

			this.update_filters();
		},

		update_filters() {
			const today = new Date();
			today.setHours(0, 0, 0, 0); // Normalize today to midnight

			if (!this.$refs.show_past_events.checked) {
				this.filtered_events = this.events.filter((event) => {
					let eventDate = new Date(event.end_date + "T23:59:59"); // Ensure full day is considered
					return eventDate >= today;
				});

				this.custom_filtered_events = this.custom_events.filter((event) => {
					let eventDate = new Date(event.end_date + "T23:59:59");
					return eventDate >= today;
				});
			} else {
				this.filtered_events = this.events;
				this.custom_filtered_events = this.custom_events;
			}

			let search = this.$refs.event_search.value.toLowerCase();

			if (search != "") {
				this.filtered_events = this.filtered_events.filter((event) => {
					let name = event.name ? event.name.toLowerCase() : "";
					let city = event.city ? event.city.toLowerCase() : "";
					let country = event.country ? event.country.toLowerCase() : "";
					let location_name = event.location_name
						? event.location_name.toLowerCase()
						: "";

					return (
						name.includes(search) ||
						city.includes(search) ||
						country.includes(search) ||
						location_name.includes(search)
					);
				});

				this.custom_filtered_events = this.custom_filtered_events.filter(
					(event) => {
						let name = event.name ? event.name.toLowerCase() : "";
						let location = event.location ? event.location.toLowerCase() : "";

						return name.includes(search) || location.includes(search);
					},
				);
			}

			if (this.filtered_events.length == 0) {
				this.no_events = true;
			} else {
				this.no_events = false;
			}

			if (this.custom_filtered_events.length == 0) {
				this.no_custom_events = true;
			} else {
				this.no_custom_events = false;
			}
		},

		select_event(event_name, event_code) {
			window.dispatchEvent(
				new CustomEvent("header_event", {
					detail: { event_name, event_code },
				}),
			);
			this.page = 4;
		},

		select_custom_event(event_name, event_code) {
			window.dispatchEvent(
				new CustomEvent("header_custom_event", {
					detail: { event_name, event_code },
				}),
			);
			this.page = 4;
		},

		create_custom_event() {
			window.dispatchEvent(new CustomEvent("open_create_custom_event"));
		},

		init() {
			this.get_events();

			window.addEventListener("refresh_event_list", (event) => {
				event.stopImmediatePropagation();
				this.get_events();
			});

			window.addEventListener("header_year", (event) => {
				const { year } = event.detail;
				this.year = year;

				this.get_events();
			});
		},
	}));
});
