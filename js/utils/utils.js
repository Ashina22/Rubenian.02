const backendURL = "http://localhost/rii-membership-backend/public";

function removeURLParams() {
    const newUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
}



function showToast(message, type = "primary", duration = 3000) {
    let toastContainer = document.getElementById("toastContainer");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toastContainer";
        toastContainer.className = "position-fixed top-0 start-50 translate-middle-x p-3";
        toastContainer.style.zIndex = "1050";
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-white bg-${type} border-0 fade show`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    toastContainer.appendChild(toast);

    const bootstrapToast = new bootstrap.Toast(toast);

    setTimeout(() => {
        bootstrapToast.hide();
        setTimeout(() => toast.remove(), 500); 
    }, duration);
}


// API Endpoints
const API_ENDPOINTS = [
    "/api/region",
    "/api/barangay",
    "/api/chapter",
    "/api/city",
    "/api/municipality",
    "/api/province",
    "/api/log",
    "/api/member"
];

// Cache name
const CACHE_NAME = "api-cache";

// Function to fetch and store API responses **only once**
async function cacheAPIData() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.warn("No token found. Skipping cache update.");
        return;
    }

    const cache = await caches.open(CACHE_NAME);

    for (const endpoint of API_ENDPOINTS) {
        const url = backendURL + endpoint;

        // Check if data is already cached
        const cachedResponse = await cache.match(url);
        if (cachedResponse) {
            console.log(`Skipped (Already Cached): ${endpoint}`);
            continue; // Skip if already cached
        }

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                await cache.put(url, response.clone()); 
                console.log(`Cached (First Load): ${endpoint}`);
            } else {
                console.warn(`Failed to fetch: ${endpoint} - Status: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
        }
    }
}

// Function to retrieve cached data (never re-fetches)
async function getCachedData(endpoint) {
    const cache = await caches.open(CACHE_NAME);
    const url = backendURL + endpoint;

    const cachedResponse = await cache.match(url);
    if (cachedResponse) {
        console.log(`Serving from cache storage: ${endpoint}`);
        return cachedResponse.json();
    }

    console.warn(`No cached data found for: ${endpoint}`);
    return null;
}

// Pre-cache data **only once** when the page loads
cacheAPIData();

export { backendURL, removeURLParams, showToast }