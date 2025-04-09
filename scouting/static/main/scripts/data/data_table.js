document.addEventListener("alpine:init", () => {
	Alpine.data("data_table", () => ({
		headers: [],
		entries: {},
		no_data: false,
		offline: false,

		/**
		 * Generates the header text with the correct format
		 *
		 * @param {String} header_text
		 * @returns {String}
		 */
		generate_header_text(header_text) {
			return header_text
				.replaceAll("_", " ")
				.split(" ")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		},

		/**
		 * Converts the entries to tabulator format
		 *
		 * @param {Array} entries
		 * @returns {Array}
		 */
		convert_entries_to_tabulator(entries) {
			const new_entries = [];

			for (entry in entries) {
				new_entries.push(entries[entry].data);
			}

			return new_entries;
		},

		/**
		 * Initializes the table
		 *
		 * Gets the data from the server and displays the table to the client
		 */
		init() {
			console.log("table started");

			fetch(`${SERVER_IP}/get_data`, {
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
					demo: DEMO,
				}),
			})
				.then((response) =>
					response.json().then((json) => {
						this.headers = json.data_headers;
						this.entries = json.data;

						if (this.headers.length === 0) {
							if (!this.offline) {
								this.no_data = true;
							}
						}

						const menu_icon = (cell, formatterParams, onRendered) =>
							"<i class='ph-bold ph-info'></i>";

						const menu_click = (e, component, onRendered) => {
							//e - the mouse/touch event that triggered the popup
							//component - column/row/cell component that triggered this popup
							//onRendered - function to call when the formatter has been rendered

							const div = document.createElement("div");
							div.classList =
								"flex flex-col dark:bg-slate-700 bg-slate-200 border-2 dark:border-slate-600 border-slate-300 rounded-2xl p-4 transition-all shadow-lg";

							const div_header = document.createElement("p");
							div_header.innerText = "Info";
							div_header.classList =
								"dark:text-white text-black text-lg text-bold text-sans";

							const div_verified = document.createElement("p");
							div_verified.classList =
								"dark:text-white text-black text-sm text-bold text-sans opacity-80";

							if (component.getData().account) {
								div_verified.innerHTML =
									'<i class="ph-bold ph-check-circle"></i> Verified Account';
							} else {
								div_verified.innerHTML =
									'<i class="ph-bold ph-x-circle"></i> Temporary Account';
							}

							const div_info = document.createElement("p");
							div_info.classList =
								"dark:text-white text-black text-md text-sans";

							const date = new Date(component.getData().created);

							if (
								component.getData().username_created &&
								component.getData().team_number_created
							) {
								div_info.innerText = `Created by ${component.getData().username_created} on team ${component.getData().team_number_created} on ${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
							} else {
								div_info.innerText = `Created on ${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
							}

							div.appendChild(div_header);
							div.appendChild(div_info);
							div.appendChild(div_verified);

							return div;
						};

						this.headers.unshift({
							title: "Info",
							hozAlign: "center",
							formatter: menu_icon,
							width: 20,
							clickPopup: menu_click,
							headerSort: false,
						});

						const table = new Tabulator(this.$refs.table, {
							height: "100%",
							data: this.entries,
							layout: "fitColumns",
							columns: this.headers,
						});
					}),
				)
				.then((data) => console.log(data))
				.catch((error) => console.error(error));

			if (navigator.onLine) {
				this.offline = false;
			} else {
				this.offline = true;
			}
		},
	}));
});
