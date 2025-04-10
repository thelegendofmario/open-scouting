/**
 * A simple dialog system for user alerts and confirmation of actions
 */

document.addEventListener("alpine:init", () => {
	Alpine.data("dialog", () => ({
		show: false,
		event_name: null,
		title: "",
		body: "",
		buttons: [],
		// buttons: [
		// 	{ text: "OK", type: "confirm", icon: "ph-bold ph-check" },
		// 	{ text: "Cancel", type: "cancel", icon: "ph-bold ph-x" },
		// ],

		/**
		 * Displays a dialog with the specified parameters.
		 *
		 * @param {string} event_name - The name of the event associated with the dialog.
		 * @param {string} title - The title of the dialog.
		 * @param {string} body - The body content of the dialog.
		 * @param {Array} buttons - An array of button objects to display in the dialog.
		 */
		show_dialog(event_name, title, body, buttons) {
			this.show = true;
			this.event_name = event_name;
			this.title = title;
			this.body = body;
			this.buttons = buttons;
		},

		/**
		 * Resets the dialog to its initial state.
		 */
		reset() {
			this.show = false;
			this.event_name = null;
			this.title = "";
			this.body = "";
			this.buttons = [];
		},

		/**
		 * Called when a confirm button is clicked. Dispatches a "dialog_confirm" event and resets the dialog
		 */
		confirm() {
			this.show = false;

			window.dispatchEvent(
				new CustomEvent("dialog_confirm", {
					detail: { event_name: this.event_name },
				}),
			);
			this.reset();
		},

		/**
		 * Called when a cancel button is clicked. Dispatches a "dialog_cancel" event and resets the dialog
		 */
		cancel() {
			this.show = false;

			window.dispatchEvent(
				new CustomEvent("dialog_cancel", {
					detail: { event_name: this.event_name },
				}),
			);
			this.reset();
		},

		/**
		 * Called when a close button is clicked. Dispatches a "dialog_close" event and resets the dialog
		 */
		close() {
			this.show = false;

			window.dispatchEvent(
				new CustomEvent("dialog_close", {
					detail: { event_name: this.event_name },
				}),
			);
			this.reset();
		},

		/**
		 * Initializes the dialog component by listening for "dialog_show" events and displaying the dialog
		 */
		init() {
			window.addEventListener("dialog_show", (event) => {
				event.stopImmediatePropagation();
				const { event_name, title, body, buttons } = event.detail;

				this.show_dialog(event_name, title, body, buttons);
			});
		},
	}));
});
