const registerServiceWorker = async () => {
	if ("serviceWorker" in navigator) {
		try {
			const registration = await navigator.serviceWorker.register("/sw.js", {
				scope: "/",
			});
			if (registration.installing) {
				log("INFO", "Service worker installing");
			} else if (registration.waiting) {
				log("INFO", "Service worker installed");
			} else if (registration.active) {
				log("INFO", "Service worker active");
			}
		} catch (error) {
			log("WARNING", `Registration failed with ${error}`);
		}
	}
};

navigator.serviceWorker.ready.then((registration) => {
	registration.active.postMessage({
		type: "service_worker_mode",
		service_worker_cache_first: JSON.parse(
			localStorage.getItem("service_worker_cache_first"),
		),
	});
	registration.active.postMessage({
		type: "offline_manual",
		offline_manual: JSON.parse(localStorage.getItem("offline_manual")),
	});
});

window.addEventListener("sw_update_offline_manual", (event) => {
	event.stopImmediatePropagation();

	navigator.serviceWorker.ready.then((registration) => {
		registration.active.postMessage({
			type: "offline_manual",
			offline_manual: JSON.parse(localStorage.getItem("offline_manual")),
		});
	});
});

if (localStorage.getItem("service_worker_cache_first") === null) {
	localStorage.setItem("service_worker_cache_first", true);
}

if (localStorage.getItem("offline_manual") === null) {
	localStorage.setItem("offline_manual", false);
}

if (localStorage.getItem("authenticated") === null) {
	const auth_json = {
		authenticated: false,
		username: "",
		display_name: "",
		team_number: "",
	};

	localStorage.setItem("authenticated", JSON.stringify(auth_json));
}

registerServiceWorker();
