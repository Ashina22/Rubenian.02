const backendURL = "http://localhost/rii-membership-backend/public";

const userId = localStorage.getItem("id").split(".")[0];
const token = localStorage.getItem("token");

function removeURLParams() {
  const newUrl = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, newUrl);
}

function showToast(message, type = "primary", duration = 3000) {
  let toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    toastContainer.className =
      "position-fixed top-0 start-50 translate-middle-x p-3";
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
  "/api/member",
];

// Cache name
const CACHE_NAME = "api-cache";

// Function to fetch and store API responses **only once**
async function cacheAPIData() {
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
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await cache.put(url, response.clone());
        console.log(`Cached (First Load): ${endpoint}`);
      } else {
        console.warn(
          `Failed to fetch: ${endpoint} - Status: ${response.status}`
        );
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

if (token !== null) {
  cacheAPIData();
}

async function getData(endpoint) {
  const url = backendURL + endpoint;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.warn(`Failed to fetch: ${endpoint} - Status: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
  }
}

async function postData(endpoint, data, formElement) {
  const url = backendURL + endpoint;

  data.forEach((value, key) => console.log(key, value));

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: data,
    });

    if (!response.ok) {
      showToast("Failed to create. try again.", "danger");
      formElement.reset();
      throw new Error(`POST request failed: ${await response.text()}`);
    }

    const cachedData = await getData(endpoint);

    // Update cache with new data
    const cache = await caches.open(CACHE_NAME);
    await cache.put(url, new Response(JSON.stringify(cachedData)));

    console.log(cachedData);

    showToast("Successfully created a new chapter.");
    formElement.reset();
  } catch (error) {
    console.error("Error in postData:", error);
    return null;
  }
}

async function putData(endpoint, data) {
  const url = backendURL + endpoint;

  data.forEach((value, key) => console.log(key, value));

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`PUT request failed: ${response.status}`);
    }

    const responseData = await response.json();

    // Update cache with new data
    const cache = await caches.open(CACHE_NAME);
    await cache.put(url, new Response(JSON.stringify(responseData)));

    return responseData;
  } catch (error) {
    console.error("Error in putData:", error);
    return null;
  }
}

document.querySelectorAll(".closeModal").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById("addChapterModal").style.display = "none";
  });
});

export {
  backendURL,
  removeURLParams,
  showToast,
  getCachedData,
  userId,
  postData,
  putData,
};
