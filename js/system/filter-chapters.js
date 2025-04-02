import {
  backendURL,
  getCachedData,
  getData,
  showToast,
  storeActivity,
  userId,
  userType,
} from "../utils/utils.js";

let endpoint_url = "";

// Define endpoints and containers
const endpoints = {
  region: { url: "/api/region", container: "regionContainer", label: "region" },
  province: {
    url: "/api/province",
    container: "provinceContainer",
    label: "province",
  },
  municipality: {
    url: "/api/municipality",
    container: "municipalityContainer",
    label: "municipality",
  },
  barangay: {
    url: "/api/barangay",
    container: "barangayContainer",
    label: "barangay",
  },
};

// Function to fetch, sort, and display data dynamically
async function fetchAndDisplay(type, displayStyle = "none") {
  const { url, container, label } = endpoints[type];
  const data = await getCachedData(url);

  if (!data) return;

  let htmlContent = "";

  for (let item of data) {
    if (document.getElementById(container) !== null) {
      let chapterIdList = item.chapters.map((ch) => ch.id).join(",");

      if (item[label] !== "None") {
        htmlContent += `
    <div style="position: relative; display: inline-block;">
        <a href="viewmembers.html?list=${chapterIdList}&label=${item[label]}">
            <button class="btn btn-region">${item[label]}</button>
        </a>
        <button class="border-0 deleteChapter" data-id="${item.id}" data-label-name="${item[label]}"
            style="position: absolute; top: -6px; right: -6px; width: 24px; height: 24px; 
                   background-color: white; border-radius: 50%; display: flex; 
                   align-items: center; justify-content: center; cursor: pointer; display: ${displayStyle}"
        >
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke-width="2" 
                stroke="currentColor" 
                style="width: 14px; height: 14px; color: red;"
            >
                <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m5 0h-18m2 0l1 14a2 2 0 002 2h8a2 2 0 002-2l1-14"
                />
            </svg>
        </button>
    </div>`;
      }
    }
  }

  if (data.length === 0) {
    htmlContent = "<p>No results found.</p>";
  }

  if ((document.getElementById(container).innerHTML = htmlContent)) {
    endpoint_url = url;
  }

  document.getElementById(container).innerHTML = htmlContent;
}

// Function to enable search
function enableSearch(inputSelector, type) {
  const searchInput = document.querySelector(inputSelector);

  if (!searchInput) return;

  searchInput.addEventListener("input", async function () {
    const searchValue = this.value.toLowerCase();
    const { url, container, label } = endpoints[type];

    const data = await getCachedData(url);
    if (!data) return;

    const filteredData = data.filter((item) =>
      item[label].toLowerCase().includes(searchValue)
    );

    let htmlContent = "";

    for (let item of filteredData) {
      if (document.getElementById(container) !== null) {
        let chapterIdList = item.chapters.map((ch) => ch.id).join(",");

        if (item[label] !== "None") {
          htmlContent += ` <div style="position: relative; display: inline-block;">
    <a href="viewmembers.html?list=${chapterIdList}&label=${item[label]}">
        <button class="btn btn-region">${item[label]}</button>
    </a>
    <button class="border-0 deleteChapter" data-id="${item.id}" data-label-name="${item[label]}"
        style="position: absolute; top: -6px; right: -6px; width: 24px; height: 24px; 
               background-color: white; border-radius: 50%; display: flex; 
               align-items: center; justify-content: center; cursor: pointer; display: none"
    >
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke-width="2" 
            stroke="currentColor" 
            style="width: 14px; height: 14px; color: red;"
        >
            <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m5 0h-18m2 0l1 14a2 2 0 002 2h8a2 2 0 002-2l1-14"
            />
        </svg>
    </button>
</div>`;
        }
      }
    }

    document.getElementById(container).innerHTML = htmlContent;
  });
}

if (userType === "Admin") {
  document.getElementById(
    "managementActionsContainer"
  ).innerHTML = `      <div id="toggleDelete" class="toggle-container me-2">
                <div class="toggle-slider"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="toggle-icon icon-on"
                  style="color: #259986"
                  width="13"
                  height="13"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="toggle-icon icon-trash icon-off"
                  style="color: #259986"
                  width="13"
                  height="13"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m5 0h-18m2 0l1 14a2 2 0 002 2h8a2 2 0 002-2l1-14"
                  />
                </svg>
              </div>
              <div class="d-flex justify-content-end">
                <button
                  class="btn btn-add"
                  data-bs-toggle="modal"
                  data-bs-target="#addChapterModal"
                >
                  Create New Province
                </button>
              </div>`;

  document
    .getElementById("toggleDelete")
    .addEventListener("click", function () {
      this.classList.toggle("active");

      let deleteBtn = document.querySelectorAll(".deleteChapter");

      if (this.classList.contains("active")) {
        deleteBtn.forEach((input) => (input.style.display = "block"));
      } else {
        deleteBtn.forEach((input) => (input.style.display = "none"));
      }
    });
}

// Fetch and display all types
fetchAndDisplay("region");
fetchAndDisplay("province");
fetchAndDisplay("municipality");
fetchAndDisplay("barangay");

// Enable search for each type
enableSearch(".search-region", "region");
enableSearch(".search-province", "province");
enableSearch(".search-municipality", "municipality");
enableSearch(".search-barangay", "barangay");

// Ensure this runs AFTER the dynamic content is inserted
document.addEventListener("click", function (event) {
  if (event.target.closest(".deleteChapter")) {
    const button = event.target.closest(".deleteChapter");
    const id = button.getAttribute("data-id");
    const labelName = button.getAttribute("data-label-name");

    // Set the delete button's data attributes
    document.getElementById("deleteButton").dataset.id = id;
    document.getElementById("deleteButton").dataset.label = labelName;

    // Open the delete modal
    const deleteModal = new bootstrap.Modal(
      document.getElementById("deleteModal")
    );
    deleteModal.show();
  }
});

document
  .getElementById("deleteButton")
  .addEventListener("click", async function () {
    const id = this.dataset.id;
    const labelName = this.dataset.label;

    try {
      const response = await fetch(`${backendURL}${endpoint_url}/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      if (!response.ok) {
        console.error("Failed to delete chapter");
        // showToast
        showToast(
          `Failed to delete a ${endpoint_url.split(" / ")[2]}.`,
          "danger"
        );
        return;
      }
      await getData(endpoint_url);
      fetchAndDisplay(endpoint_url.split("/")[2], "inline-block");
      showToast(`Successfully deleted a ${endpoint_url.split("/")[2]}.`);

      storeActivity(
        userId,
        `Delete ${
          endpoint_url.split("/")[2].charAt(0).toUpperCase() +
          endpoint_url.split("/")[2].slice(1)
        }`,
        `Deleted ${
          endpoint_url.split("/")[2].charAt(0).toUpperCase() +
          endpoint_url.split("/")[2].slice(1)
        }: ${labelName}`
      );

      // Close the modal
      const deleteModal = bootstrap.Modal.getInstance(
        document.getElementById("deleteModal")
      );
      deleteModal.hide();
    } catch (error) {
      console.error("Error deleting chapter:", error);
    }
  });
