const addResourcesToCache = async (resources) => {
    const cache = await caches.open("v1");
    await cache.addAll(resources);
    console.log("Cached many resources");
};

const putInCache = async (request, response) => {
    const cache = await caches.open("v1");
    await cache.put(request, response);
    console.log("Cached: ", request.url);
};

const cacheFirst = async ({ request, preloadResponsePromise }) => {
    // First try to get the resource from the network
    try {
        const responseFromNetwork = await fetch(request);
        // response may be used only once
        // we need to save clone to put one copy in cache
        // and serve second one
        if (responseFromNetwork) {
            putInCache(request, responseFromNetwork.clone());
            return responseFromNetwork;
        }

        // Next try to use (and cache) the preloaded response, if it's there
        const preloadResponse = await preloadResponsePromise;
        if (preloadResponse) {
            console.log("Using preload response", preloadResponse);
            putInCache(request, preloadResponse.clone());
            return preloadResponse;
        }

        // Finally try to get the resource from cache
        const responseFromCache = await caches.match(request);
        if (responseFromCache) {
            console.log("Found in cache: ", request.url);
            return responseFromCache;
        }
    } catch (error) {
        return new Response("Network error happened", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
        });
    }
};

// Enable navigation preload
const enableNavigationPreload = async () => {
    if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
    }
};

self.addEventListener("activate", (event) => {
    event.waitUntil(enableNavigationPreload());
});

self.addEventListener("install", (event) => {
    event.waitUntil(
        addResourcesToCache([
            "/",
            "/contribute",
            "/data",
            "/static/main/scripts/app.js",
            "/static/main/styles.css",
            "/static/main/images/favicon.ico",
            "/static/main/images/icon_rounded.png",
            "/static/main/images/logo_dark.png",
            "/static/main/images/logo_light.png",
        ]),
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        cacheFirst({
            request: event.request,
            preloadResponsePromise: event.preloadResponse,
        }),
    );
});
