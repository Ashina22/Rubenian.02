import { getCachedData } from "../utils/utils.js";

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
async function fetchAndDisplay(type) {
  const { url, container, label } = endpoints[type];
  const data = await getCachedData(url);

  if (!data) return;

  let htmlContent = "";

  for (let item of data) {
    let chapterIdList = item.chapters.map((ch) => ch.id).join(",");

    if (item[label] !== "None") {
      htmlContent += `
                <a href="viewmembers.html?list=${chapterIdList}&label=${item[label]}">
                    <button class="btn btn-region">${item[label]}</button>
                </a>`;
    }
  }

  if (data.length === 0) {
    htmlContent = "<p>No results found.</p>";
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
      let chapterIdList = item.chapters.map((ch) => ch.id).join(",");

      if (item[label] !== "None") {
        htmlContent += `
                    <a href="viewmembers.html?list=${chapterIdList}">
                        <button class="btn btn-region">${item[label]}</button>
                    </a>`;
      }
    }

    document.getElementById(container).innerHTML = htmlContent;
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
