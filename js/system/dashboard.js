import { backendURL, showToast } from "../utils/utils.js";

// Global variables
let currentPage = 1;
let totalPages = 1;
let currentSearch = "";
let currentSort = "desc";
let finalTotals = [];
const paginationContainer = document.querySelector(".pagination");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");

function animateValue(element, start, end, isCurrency = false) {
  const duration = 500; // Fixed 2-second duration
  let startTimestamp = null;

  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const current = Math.floor(progress * (end - start) + start);

    if (isCurrency) {
      element.innerHTML = `₱${current.toLocaleString()}`;
    } else {
      element.innerHTML = current.toLocaleString();
    }

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
}

// Main function to load data
async function loadChapterContributions(page = 1, search = "", sort = "desc") {
  try {
    const url = new URL(`${backendURL}/api/chapters/contributions-summary`);
    url.searchParams.append("page", page);
    if (search) url.searchParams.append("search", search);
    if (sort) url.searchParams.append("sort", sort);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (!response.ok) throw new Error(await response.text());

    const { data, pagination, totals } = await response.json();

    // document.getElementById("total_members").innerHTML = totals.members;
    // document.getElementById("total_contributions").innerHTML =
    //   totals.contributions;
    // document.getElementById("total_chapters").innerHTML = totals.chapters;

    finalTotals = totals;

    if (data.length === 0) {
      document.querySelector(
        "#contributionsTable"
      ).innerHTML = `<td colspan="5" class="text-center">No Chapter Found.</td>`;
      return;
    }

    // Update table
    renderTable(data);

    // Update pagination
    if (pagination) {
      currentPage = pagination.current_page;
      totalPages = pagination.last_page;
      setupPagination(pagination);
    }
  } catch (error) {
    console.error("Error loading chapter contributions:", error);
    showToast("Failed to load chapter contributions", "danger");
  }
}

async function fetchLogsLength() {
  try {
    const response = await fetch(backendURL + "/api/log", {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    if (!response.ok) throw new Error(await response.text());
    const logsData = await response.json();

    document.getElementById("total_logs").innerHTML = logsData.total;
  } catch (error) {
    console.error("Error fetching logs length:", error);
    showToast("Failed to fetch logs length", "danger");
  }
}

// Render table rows
function renderTable(data) {
  let tableHTML = "";
  data.forEach((chapter) => {
    tableHTML += ` <tr>
                    <td>${chapter.name}</td>
                    <td>${chapter.members}</td>
                    <td>
                      <div class="d-flex align-items-center">
                        <span class="me-2">${chapter.member_percentage}%</span>
                        <div class="progress w-100" style="height: 6px">
                          <div
                            class="progress-bar"
                            style="width: ${
                              chapter.member_percentage
                            }%; background-color: #259986"
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="d-flex align-items-center">
                        <span class="me-2">${
                          chapter.contribution_percentage
                        }%</span>
                        <div class="progress w-100" style="height: 6px">
                          <div
                            class="progress-bar"
                            style="width: ${
                              chapter.contribution_percentage
                            }%; background-color: #259986"
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>₱${chapter.contributions.toLocaleString()}</td>
                  </tr>`;
  });
  document.querySelector("#contributionsTable").innerHTML = tableHTML;
}

// Pagination setup
function setupPagination(paginationData) {
  paginationContainer.innerHTML = "";

  // Previous Button
  paginationContainer.innerHTML += `
    <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
      <a class="page-link" href="#" onclick="changePage(${
        currentPage - 1
      })">Previous</a>
    </li>
  `;

  // First Page
  if (currentPage > 2) {
    paginationContainer.innerHTML += `
      <li class="page-item">
        <a class="page-link" href="#" onclick="changePage(1)">1</a>
      </li>
      ${
        currentPage > 3
          ? '<li class="page-item disabled"><span class="page-link">...</span></li>'
          : ""
      }
    `;
  }

  // Current page and neighbors
  const startPage = Math.max(1, currentPage - 1);
  const endPage = Math.min(totalPages, currentPage + 1);

  for (let i = startPage; i <= endPage; i++) {
    paginationContainer.innerHTML += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
      </li>
    `;
  }

  // Last Page
  if (currentPage < totalPages - 1) {
    paginationContainer.innerHTML += `
      ${
        currentPage < totalPages - 2
          ? '<li class="page-item disabled"><span class="page-link">...</span></li>'
          : ""
      }
      <li class="page-item">
        <a class="page-link" href="#" onclick="changePage(${totalPages})">${totalPages}</a>
      </li>
    `;
  }

  // Next Button
  paginationContainer.innerHTML += `
    <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
      <a class="page-link" href="#" onclick="changePage(${
        currentPage + 1
      })">Next</a>
    </li>
  `;
}

// Event handlers
window.changePage = function (page) {
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  loadChapterContributions(page, currentSearch, currentSort);
};

// Search handler
searchInput.addEventListener(
  "input",
  debounce(() => {
    currentSearch = searchInput.value;
    currentPage = 1; // Reset to first page when searching
    loadChapterContributions(currentPage, currentSearch, currentSort);
  }, 300)
);

// Sort handler
sortSelect.addEventListener("change", () => {
  currentSort = sortSelect.value;
  currentPage = 1; // Reset to first page when changing sort
  loadChapterContributions(currentPage, currentSearch, currentSort);
});

// Debounce function for search
function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

// Initial load
await loadChapterContributions();

// Fetch logs length
await fetchLogsLength();
// Start animations simultaneously
animateValue(document.getElementById("total_members"), 0, finalTotals.members);
animateValue(
  document.getElementById("total_contributions"),
  0,
  finalTotals.contributions,
  true
);
animateValue(
  document.getElementById("total_chapters"),
  0,
  finalTotals.chapters
);
