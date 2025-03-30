import { backendURL, getCachedData } from "../utils/utils.js";

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
      backendURL + `/api/chapter?search=${encodeURIComponent(search)}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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

      return ` <li class="list-group-item">
                  ${chapters} Chapter
                  <button
                    class="delete-btn"
                    data-bs-toggle="modal"
                    data-bs-target="#deleteModal"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>
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
    console.log("Toggle ON");
    searchInputs.forEach((input) => (input.style.display = "block"));
  } else {
    console.log("Toggle OFF");
    searchInputs.forEach((input) => (input.style.display = "none"));
  }
});
document.querySelector(".search-chapters").addEventListener("input", (e) => {
  e.preventDefault();
  console.log(e.target.value);

  fetchChapters(e.target.value);
});

loadSelectOptions();
fetchChapters();
