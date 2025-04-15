/**
 * Logs messages to the console with colors and location information
 *
 * Also stores log messages in a global array, so the user can copy logs for debugging
 */

// biome-ignore lint/style/noVar: <explanation>
var logs = JSON.parse(localStorage.getItem("logs") || "[]");
if (logs.length > 100) {
	logs = logs.slice(logs.length - 100);
}

window.addEventListener("beforeunload", () => {
	localStorage.setItem("logs", JSON.stringify(logs));
});

/**
 * Logs a message to the console with colors and location information
 *
 * The location information is colored as needed in different environments
 *
 * Also stores the logs in the global array
 *
 * @param {string} [level="INFO"] - The level of the log message.
 * @param {...*} messages - The messages to be logged.
 */
function log(level = "INFO", ...messages) {
	const error = new Error();
	const stackLines = error.stack?.split("\n");

	const callerLine = stackLines
		?.find(
			(line) =>
				line.includes("at") && !line.includes("log") && !line.includes("Error"),
		)
		?.trim();

	let location = "";
	if (callerLine) {
		const match = callerLine.match(/(?:at\s+)?(?:.*\()?(.+):(\d+):(\d+)\)?/);
		if (match) {
			let [, file, line, column] = match;
			file = file.replace(/.*\/([^\/]+\.js$)/, "$1");
			location = ` (${file}:${line}:${column})`;
		}
	}

	const isBrowser =
		typeof window !== "undefined" && typeof window.document !== "undefined";

	const levelMap = {
		INFO: "info",
		DEBUG: "debug",
		WARNING: "warn",
		ERROR: "error",
	};

	const consoleMethod = levelMap[level.toUpperCase()] || "log";

	if (isBrowser) {
		const baseMessage = messages.join(" ").trim();
		console[consoleMethod](
			`%c${baseMessage}%c${location}`,
			"color: inherit;",
			"color: gray; font-style: italic;",
		);

		logs.push({ level: level, message: baseMessage + location });
	} else {
		const dimLocation = `\x1b[2m${location}\x1b[0m`;
		console[consoleMethod](...messages, dimLocation);

		logs.push({ level: level, message: [...messages, dimLocation].join(" ") });
	}

	console.log(logs);
}

window.onerror = (message, source, lineno, colno, error) => {
	log("ERROR", `${message} (${source.split("/").pop()}:${lineno}:${colno})`);
	// Handle the error (e.g., log it to a server, display a user-friendly message)
	return true; // Prevent the default error handling (optional)
};
