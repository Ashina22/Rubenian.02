import { backendURL } from "../utils/utils.js";

let eventSource;
let existingLogIds = new Set();
let currentPage = 1;
let totalPages = 1;
let searchInputs = "";
const logsPerPage = 20;
const paginationContainer = document.querySelector(".pagination");
let isInitialLoad = true;

eventSource = new EventSource(`${backendURL}/api/log/stream`);

eventSource.onopen = () => console.log("SSE Connection established");

eventSource.onmessage = (e) => {
  try {
    if (e.data.trim() === ": heartbeat") return;

    const data = JSON.parse(e.data);
    if (Array.isArray(data)) {
      const newLogs = data.filter((log) => !existingLogIds.has(log.id));

      if (newLogs.length > 0) {
        newLogs.forEach((log) => existingLogIds.add(log.id));

        // Only update UI if we're on the first page and not during initial load
        if (currentPage === 1 && !isInitialLoad) {
          prependNewLogs(newLogs);
        }
      }
    }
  } catch (err) {
    console.error("SSE Parse error:", err);
  }
};

eventSource.onerror = (e) => {
  console.error("SSE Error:", e);
  eventSource.close();
  setTimeout(connectSSE, 3000);
};

function prependNewLogs(logs) {
  const tableBody = document.getElementById("logsTable");
  const fragment = document.createDocumentFragment();

  // Sort new logs by timestamp (newest first)
  logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  logs.forEach((log) => {
    const row = createLogRow(log);
    fragment.appendChild(row);
  });

  // Insert new logs at the top while maintaining proper order
  if (tableBody.firstChild) {
    tableBody.insertBefore(fragment, tableBody.firstChild);
  } else {
    tableBody.appendChild(fragment);
  }

  // Ensure we don't exceed the page limit
  const allRows = tableBody.querySelectorAll("tr");
  if (allRows.length > logsPerPage) {
    for (let i = logsPerPage; i < allRows.length; i++) {
      tableBody.removeChild(allRows[i]);
    }
  }
}

function createLogRow(log) {
  const row = document.createElement("tr");

  const idCell = document.createElement("td");
  idCell.textContent = log.id;
  idCell.style.textAlign = "center";
  idCell.style.verticalAlign = "middle";
  row.appendChild(idCell);

  const timestampCell = document.createElement("td");
  timestampCell.textContent = new Date(log.created_at).toLocaleString();
  timestampCell.style.textAlign = "center";
  timestampCell.style.verticalAlign = "middle";
  row.appendChild(timestampCell);

  const userCell = document.createElement("td");
  const middleName = log.user?.middlename ? ` ${log.user.middlename}` : "";
  userCell.innerHTML = `${log.user?.firstname || ""}${middleName} ${
    log.user?.lastname || ""
  }`;
  userCell.style.textAlign = "center";
  userCell.style.verticalAlign = "middle";
  userCell.style.whiteSpace = "nowrap";
  row.appendChild(userCell);

  const actionCell = document.createElement("td");
  actionCell.textContent = log.action;
  actionCell.style.verticalAlign = "middle";
  actionCell.style.textAlign = "center";
  row.appendChild(actionCell);

  const detailsCell = document.createElement("td");
  detailsCell.textContent = log.details;
  detailsCell.style.whiteSpace = "nowrap";
  detailsCell.style.padding = "0 15px";
  detailsCell.style.overflow = "hidden";
  detailsCell.style.textOverflow = "ellipsis";
  detailsCell.style.verticalAlign = "middle";
  detailsCell.style.textAlign = "center";
  detailsCell.title = log.details;
  row.appendChild(detailsCell);

  return row;
}

async function loadLogs(page = 1) {
  try {
    const response = await fetch(
      `${backendURL}/api/log?page=${page}&per_page=${logsPerPage}&search=${searchInputs}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
      }
    );

    const data = await response.json();
    const tableBody = document.getElementById("logsTable");

    if (data.logs.length === 0) {
      tableBody.innerHTML = `<td colspan="5" class="text-center">No Logs Found.</td>`;
      return;
    }

    tableBody.innerHTML = ""; // Clear existing logs

    // Sort logs by timestamp (newest first)
    data.logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Update existingLogIds only if loading first page
    if (page === 1) {
      existingLogIds = new Set(data.logs.map((log) => log.id));
    }

    data.logs.forEach((log) => {
      const row = createLogRow(log);
      tableBody.appendChild(row);
    });

    setupPagination(data);
    currentPage = page;
  } catch (error) {
    console.error("Error loading logs:", error);
  }
}

function setupPagination(data) {
  totalPages = data.last_page;
  currentPage = data.current_page;
  paginationContainer.innerHTML = "";

  const maxVisiblePages = 3;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = startPage + maxVisiblePages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // Previous Button
  paginationContainer.innerHTML += `
    <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
      <a class="page-link" href="#" onclick="changePage(${
        currentPage - 1
      })">Previous</a>
    </li>
  `;

  // First Page + Ellipsis
  if (startPage > 1) {
    paginationContainer.innerHTML += `
      <li class="page-item">
        <a class="page-link" href="#" onclick="changePage(1)">1</a>
      </li>
    `;
    if (startPage > 2) {
      paginationContainer.innerHTML += `
        <li class="page-item disabled"><span class="page-link">...</span></li>
      `;
    }
  }

  // Page Numbers
  for (let i = startPage; i <= endPage; i++) {
    paginationContainer.innerHTML += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
      </li>
    `;
  }

  // Last Page + Ellipsis
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationContainer.innerHTML += `
        <li class="page-item disabled"><span class="page-link">...</span></li>
      `;
    }
    paginationContainer.innerHTML += `
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

// Global function for pagination
window.changePage = function (page) {
  if (page < 1 || page > totalPages) return;
  loadLogs(page);
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadLogs(1); // 👈 SSE will be connected *after* initial logs are fully loaded
});

window.addEventListener("beforeunload", () => {
  if (eventSource) eventSource.close();
});

// Search functionality
document.querySelector(".search-logs").addEventListener("input", function () {
  searchInputs = this.value;
  currentPage = 1; // Reset to first page when searching
  console.log(searchInputs);
  loadLogs(currentPage);
});
