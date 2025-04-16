import {
  backendURL,
  getCachedData,
  getData,
  showToast,
  storeActivity,
  userId,
} from "../utils/utils.js";

let endpoint_url = "";
let btnLabel = "";

// Define endpoints and containers
const endpoints = {
  barangay: {
    url: "/api/members/barangays/list",
    container: "barangayContainer",
    label: "barangay",
  },
};

// Generate HTML for a barangay with member count
function generateBarangayHTML(barangay, displayStyle) {
  return `
    <div style="position: relative; display: inline-block;">
      <a href="viewmembers.html?barangay=${encodeURIComponent(
        barangay.barangay
      )}&member_ids=${barangay.member_ids.join(",")}">
        <button class="btn btn-region">
          ${barangay.barangay}
        </button>
      </a>
     
    </div>`;
}

// Process and display barangay data
async function processAndDisplayData(
  type,
  displayStyle = "none",
  filterFn = null
) {
  const { url, container, label } = endpoints[type];
  const response = await getCachedData(url);

  if (!response || !response.data) return;

  const barangays = response.data;
  let htmlContent = "";
  const filteredData = filterFn ? barangays.filter(filterFn) : barangays;

  filteredData.forEach((barangay) => {
    htmlContent += generateBarangayHTML(barangay, displayStyle);
  });

  if (filteredData.length === 0) {
    htmlContent = "<p>No barangays found.</p>";
  }

  document.getElementById(container).innerHTML = htmlContent;
  endpoint_url = url;
  btnLabel = label;
}

// Fetch and display data
async function fetchAndDisplay(type, displayStyle = "none") {
  await processAndDisplayData(type, displayStyle);
}

// Enable search functionality
function enableSearch(inputSelector, type, displayStyle = "none") {
  const searchInput = document.querySelector(inputSelector);
  if (!searchInput) return;

  searchInput.addEventListener("input", async function () {
    const searchValue = this.value.toLowerCase();
    await processAndDisplayData(type, displayStyle, (barangay) =>
      barangay.barangay.toLowerCase().includes(searchValue)
    );
  });
}

// Initialize UI components

// Event delegation for delete buttons
document.addEventListener("click", function (event) {
  const deleteBtn = event.target.closest(".deleteChapter");
  if (!deleteBtn) return;

  const barangayName = deleteBtn.getAttribute("data-id");
  const labelName = deleteBtn.getAttribute("data-label-name");
  const deleteModal = new bootstrap.Modal(
    document.getElementById("deleteModal")
  );

  document.getElementById("deleteButton").dataset.id = barangayName;
  document.getElementById("deleteButton").dataset.label = labelName;
  deleteModal.show();
});

// Delete button handler
document
  .getElementById("deleteButton")
  .addEventListener("click", async function () {
    const { id, label } = this.dataset;
    if (!id || !label) return;

    try {
      const response = await fetch(
        `${backendURL}${endpoint_url}?barangay=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete barangay");

      await getData(endpoint_url);
      fetchAndDisplay("barangay", "inline-block");

      showToast(`Successfully deleted barangay ${label}.`);
      storeActivity(userId, "Delete Barangay", `Deleted Barangay: ${label}`);

      bootstrap.Modal.getInstance(
        document.getElementById("deleteModal")
      ).hide();
    } catch (error) {
      console.error("Error deleting barangay:", error);
      showToast("Failed to delete barangay.", "danger");
    }
  });

// Initialize the page
function initPage() {
  fetchAndDisplay("barangay");
  enableSearch(".search-barangay", "barangay");
}

// Start the application
initPage();
