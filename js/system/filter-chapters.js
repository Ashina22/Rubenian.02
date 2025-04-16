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
let btnLabel = "";

// Define endpoints and containers
const endpoints = {
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
};

// Generate HTML for a chapter with optional region info
function generateChapterHTML(chapter, displayStyle) {
  let chapterIds = "";
  const regionBadge = chapter.region_info
    ? `<span class="region-badge">${chapter.region_info}</span>`
    : "";

  if (btnLabel === "province") {
    chapterIds = chapter.chapters.map((ch) => ch.chapter_id).join(", ");
  }

  return `
    <div style="position: relative; display: inline-block;">
      <a href="viewmembers.html?list=${
        !chapter.chapter_id ||
        chapter.chapter_id === null ||
        chapter.chapter_id === undefined
          ? chapterIds
          : chapter.chapter_id
      }&label=${chapter.name}&region-info=${chapter.region_info}">
        <button class="btn btn-region">
          ${chapter.name}
          ${regionBadge}
        </button>
      </a>
      <button class="border-0 deleteChapter" data-id="${
        chapter.id
      }" data-label-name="${chapter.name}"
        style="position: absolute; top: -6px; right: -6px; width: 24px; height: 24px;
               background-color: white; border-radius: 50%; display: flex;
               align-items: center; justify-content: center; cursor: pointer; display: ${displayStyle}">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
          stroke="currentColor" style="width: 14px; height: 14px; color: red;">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m5 0h-18m2 0l1 14a2 2 0 002 2h8a2 2 0 002-2l1-14"/>
        </svg>
      </button>
    </div>`;
}

// Process and display data with combined sources
async function processAndDisplayData(
  type,
  displayStyle = "none",
  filterFn = null
) {
  const { url, container, label } = endpoints[type];
  const data = await getCachedData("/api/chapters/locations");

  if (!data) return;

  console.log(data);
  let dataSource = [];
  let combinedData = [];
  btnLabel = label;

  switch (label) {
    case "province":
      dataSource = data.provinces;
      break;
    case "municipality":
      dataSource = data.municipalities;
      break;
    default:
      return;
  }

  let htmlContent = "";
  const filteredData = filterFn ? dataSource.filter(filterFn) : dataSource;

  if (label !== "province") {
    filteredData.forEach((item) => {
      if (item.name !== "None") {
        item.chapters.forEach((chapter) => {
          if (chapter.name !== "None") {
            // Include region info in each chapter
            const chapterWithRegion = {
              ...chapter,
              region_info: item.region_info || "",
            };
            htmlContent += generateChapterHTML(chapterWithRegion, displayStyle);
          }
        });
      }
    });
  }

  if (label === "province") {
    filteredData.forEach((item) => {
      if (item.name !== "None") {
        htmlContent += generateChapterHTML(item, displayStyle);
      }
    });
  }

  if (filteredData.length === 0) {
    htmlContent = "<p>No results found.</p>";
  }

  if ((document.getElementById(container).innerHTML = htmlContent)) {
    endpoint_url = url;
    btnLabel = label;
    document.getElementById(container).innerHTML = htmlContent;
  }
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

    await processAndDisplayData(type, displayStyle, (item) => {
      if (btnLabel === "province") {
        return item.name.toLowerCase().includes(searchValue);
      } else {
        // For provinces, check if any chapter name matches
        return item.chapters.some((chapter) =>
          chapter.name.toLowerCase().includes(searchValue)
        );
      }
    });
  });
}

// Initialize UI components
// function initUI() {
//   if (userType === "Admin") {
//     document.getElementById("managementActionsContainer").innerHTML = `
//       <div id="toggleDelete" class="toggle-container me-2">
//         <div class="toggle-slider"></div>
//         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
//           stroke="currentColor" class="toggle-icon icon-on" style="color: #259986" width="13" height="13">
//           <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
//         </svg>
//         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
//           stroke="currentColor" class="toggle-icon icon-trash icon-off" style="color: #259986" width="13" height="13">
//           <path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m5 0h-18m2 0l1 14a2 2 0 002 2h8a2 2 0 002-2l1-14"/>
//         </svg>
//       </div>
//       <div class="d-flex justify-content-end">
//         <button class="btn btn-add small-btn" data-bs-toggle="modal" data-bs-target="#addChapterModal">
//           Create ${btnLabel.charAt(0).toUpperCase() + btnLabel.slice(1)}
//         </button>
//       </div>`;

//     document
//       .getElementById("toggleDelete")
//       .addEventListener("click", function () {
//         this.classList.toggle("active");
//         const deleteBtns = document.querySelectorAll(".deleteChapter");
//         deleteBtns.forEach(
//           (btn) =>
//             (btn.style.display = this.classList.contains("active")
//               ? "flex"
//               : "none")
//         );
//       });
//   }
// }

// Event delegation for delete buttons
document.addEventListener("click", function (event) {
  const deleteBtn = event.target.closest(".deleteChapter");
  if (!deleteBtn) return;

  const id = deleteBtn.getAttribute("data-id");
  const labelName = deleteBtn.getAttribute("data-label-name");
  const deleteModal = new bootstrap.Modal(
    document.getElementById("deleteModal")
  );

  document.getElementById("deleteButton").dataset.id = id;
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
      const response = await fetch(`${backendURL}${endpoint_url}/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
      });

      if (!response.ok) throw new Error("Failed to delete chapter");

      await getData(endpoint_url);
      const type = endpoint_url.split("/")[2];
      fetchAndDisplay(type, "inline-block");

      showToast(`Successfully deleted a ${type}.`);
      storeActivity(
        userId,
        `Delete ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        `Deleted ${type.charAt(0).toUpperCase() + type.slice(1)}: ${label}`
      );

      bootstrap.Modal.getInstance(
        document.getElementById("deleteModal")
      ).hide();
    } catch (error) {
      console.error("Error deleting chapter:", error);
      showToast(`Failed to delete a ${endpoint_url.split("/")[2]}.`, "danger");
    }
  });

// Initialize the page
function initPage() {
  // initUI();
  fetchAndDisplay("province");
  fetchAndDisplay("municipality");
  enableSearch(".search-province", "province");
  enableSearch(".search-municipality", "municipality");
}

// Start the application
initPage();
