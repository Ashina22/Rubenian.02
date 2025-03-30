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
    <div style="position: relative; display: inline-block;">
        <a href="viewmembers.html?list=${chapterIdList}&label=${item[label]}">
            <button class="btn btn-region">${item[label]}</button>
        </a>
        <button class="border-0 deleteButton" 
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

document.getElementById("toggleDelete").addEventListener("click", function () {
  this.classList.toggle("active");

  let deleteBtn = document.querySelectorAll(".deleteButton");

  if (this.classList.contains("active")) {
    console.log("Toggle ON");
    deleteBtn.forEach((input) => (input.style.display = "block"));
  } else {
    console.log("Toggle OFF");
    deleteBtn.forEach((input) => (input.style.display = "none"));
  }
});

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
