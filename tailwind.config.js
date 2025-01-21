/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./scouting/main/templates/*.html",
		!"./scouting/main/templates/email/*.html",
	],
	theme: {
		extend: {
			borderWidth: {
				1: "1px",
			},
		},
	},
	plugins: [require("@tailwindcss/forms")],
	darkMode: "selector",
};
