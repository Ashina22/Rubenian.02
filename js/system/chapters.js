import {
  backendURL,
  getCachedData,
  showToast,
  storeActivity,
  userId,
  userType,
} from "../utils/utils.js";

const regionSelect = document.getElementById("regionSelect");
const provinceSelect = document.getElementById("provinceSelect");
const citySelect = document.getElementById("citySelect");
const municipalitySelect = document.getElementById("municipalitySelect");
const barangaySelect = document.getElementById("barangaySelect");
const chapterContainer = document.getElementById("chapterContainer");

const chapter_endpoint = "/api/chapter";
const region_endpoint = "/api/region";
const province_endpoint = "/api/province";
const city_endpoint = "/api/city";
const municipality_endpoint = "/api/municipality";
const barangay_endpoint = "/api/barangay";

async function fetchChapters(search = "") {
  try {
    const response = await fetch(
      backendURL + `${chapter_endpoint}?search=${encodeURIComponent(search)}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch data");

    const chapterData = await response.json();

    displayChapters(chapterData);
  } catch (error) {
    console.error("Error fetching chapters:", error);
  }
}

function displayChapters(chapterData) {
  let chaptersHTML = chapterData
    .filter((_, index) => index !== 2) // Skip index 2
    .map((chapter) => {
      let chapters = [
        chapter.region?.region,
        chapter.municipality?.municipality,
        chapter.province?.province,
        chapter.city?.city,
        chapter.barangay?.barangay,
      ]
        .filter((value) => value && value !== "None")
        .join(", ");

      return ` <li class="list-group-item d-flex border-bottom border-2">
                  <small style="width: 85%; font-size: 14px" >${chapters} Chapter</small>
                  ${
                    userType === "Admin"
                      ? `<button
                    class="delete-btn deleteChapter deleteChaptBtn"
                    data-id="${chapter.id}"
                    data-chapter-name="${chapters}"

                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>`
                      : ``
                  }
                </li>`;
    })
    .join("");

  chapterContainer.innerHTML = chaptersHTML;
}

async function loadSelectOptions() {
  const regionData = await getCachedData(region_endpoint);
  const provinceData = await getCachedData(province_endpoint);
  const cityData = await getCachedData(city_endpoint);
  const municipalityData = await getCachedData(municipality_endpoint);
  const barangayData = await getCachedData(barangay_endpoint);

  function generateOptions(data, key) {
    if (!data || data.length === 0) return "";
    return data
      .map((item) => {
        let value = item[key] ? item[key] : "";
        return `<option value="${item.id}">${value}</option>`;
      })
      .join("");
  }

  // Set default options
  regionSelect.innerHTML =
    `<option value="">Select Region</option>` +
    generateOptions(regionData, "region");
  provinceSelect.innerHTML =
    `<option value="">Select Province</option>` +
    generateOptions(provinceData, "province");
  citySelect.innerHTML =
    `<option value="">Select City</option>` + generateOptions(cityData, "city");
  municipalitySelect.innerHTML =
    `<option value="">Select Municipality</option>` +
    generateOptions(municipalityData, "municipality");
  barangaySelect.innerHTML =
    `<option value="">Select Barangay</option>` +
    generateOptions(barangayData, "barangay");
}

document.getElementById("toggleSearch").addEventListener("click", function () {
  this.classList.toggle("active");

  let searchInputs = document.querySelectorAll(".search-input");
  searchInputs.forEach((input) => (input.style.display = "none"));

  if (this.classList.contains("active")) {
    searchInputs.forEach((input) => (input.style.display = "block"));
  } else {
    searchInputs.forEach((input) => (input.style.display = "none"));
  }
});

document
  .querySelector(".search-chapters")
  .addEventListener("input", function () {
    searchInputs = this.value;
    if (searchInputs.length === 0) {
      fetchChapters();
    }
  });
document.getElementById("search_form").addEventListener("submit", (e) => {
  e.preventDefault();

  let searchInputs = document.querySelector(".search-chapters").value;

  fetchChapters(searchInputs);
});

loadSelectOptions();
fetchChapters();

document.addEventListener("click", function (e) {
  if (e.target.closest(".deleteChapter")) {
    const button = e.target.closest(".deleteChapter");
    const id = button.getAttribute("data-id");
    const chapterName = button.getAttribute("data-chapter-name");

    // Set the delete button's data-id
    document.getElementById("deleteButton").dataset.id = id;
    document.getElementById("deleteButton").dataset.chapterName = chapterName;

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
    const chapterName = this.dataset.chapterName;

    try {
      const response = await fetch(`${backendURL}/api/chapter/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
      });

      if (!response.ok) {
        console.error("Failed to delete chapter");
        // showToast
        showToast(`Failed to delete a chapter.`, "danger");
        return;
      }

      const data = await response.json();

      fetchChapters();
      showToast(`Successfully deleted a chapter.`);

      storeActivity(
        userId,
        "Delete Chapter",
        `Deleted Chapter: ${chapterName}`
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
