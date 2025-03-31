import { getData, postData } from "../utils/utils.js";

const formMappings = [
  {
    id: "create_region_form",
    endpoint: "/api/region",
    updateUI: updateRegionList,
  },
  {
    id: "create_province_form",
    endpoint: "/api/province",
    updateUI: updateProvinceList,
  },
  {
    id: "create_municipality_form",
    endpoint: "/api/municipality",
    updateUI: updateMunicipalityList,
  },
  { id: "create_city_form", endpoint: "/api/city", updateUI: updateCityList },
  {
    id: "create_barangay_form",
    endpoint: "/api/barangay",
    updateUI: updateBarangayList,
  },
  {
    id: "create_chapter_form",
    endpoint: "/api/chapter",
    updateUI: updateChapterList,
  },
];

formMappings.forEach(({ id, endpoint, updateUI }) => {
  const form = document.getElementById(id);
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      postData(endpoint, formData, form, updateUI);
    });
  }
});

async function updateRegionList() {
  const data = await getData("/api/region");
  renderList("regionContainer", data, "region");
}

async function updateProvinceList() {
  const data = await getData("/api/province");
  renderList("provinceContainer", data, "province");
}

async function updateMunicipalityList() {
  const data = await getData("/api/municipality");
  renderList("municipalityContainer", data, "municipality");
}

async function updateCityList() {
  const data = await getData("/api/city");
  renderList("cityContainer", data, "city");
}

async function updateBarangayList() {
  const data = await getData("/api/barangay");
  renderList("barangayContainer", data, "barangay");
}

async function updateChapterList() {
  const data = await getData("/api/chapter");
  renderList("chapterContainer", data, "chapter");
}

function renderList(containerId, data, label) {
  console.log(data);
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = ""; // Clear old data

  let htmlContent = ""; // Create a single string to store all HTML

  for (let item of data) {
    let chapterIdList = item.chapters.map((ch) => ch.id).join(",");

    if (item.hasOwnProperty(label)) {
      if (item[label] !== "None") {
        htmlContent += `
      <div style="position: relative; display: inline-block;">
          <a href="viewmembers.html?list=${chapterIdList}&label=${item[label]}">
              <button class="btn btn-region">${item[label]}</button>
          </a>
          <button class="border-0 deleteChapter" data-id="${item.id}"
              style="position: absolute; top: -6px; right: -6px; width: 24px; height: 24px; 
                     background-color: white; border-radius: 50%; display: flex; 
                     align-items: center; justify-content: center; cursor: pointer; display: none">
              <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke-width="2" 
                  stroke="currentColor" 
                  style="width: 14px; height: 14px; color: red;">
                  <path 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m5 0h-18m2 0l1 14a2 2 0 002 2h8a2 2 0 002-2l1-14"/>
              </svg>
          </button>
      </div>`;
      }
    } else {
      console.error(
        `Key "${label}" not found in item. Available keys:`,
        Object.keys(item)
      );
    }
  }

  // Update the container **only once**
  container.innerHTML = htmlContent;
}
