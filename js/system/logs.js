import { backendURL } from "../utils/utils.js";

let eventSource;
let existingLogIds = new Set();
let currentPage = 1;
let totalPages = 1;
const logsPerPage = 20;
const paginationContainer = document.querySelector(".pagination");

function connectSSE() {
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

          // Only prepend if we're on the first page
          if (currentPage === 1) {
            prependNewLogs(newLogs);
          }
          // Always update the total count (you'll need to adjust your SSE endpoint to return total count)
          // totalLogs += newLogs.length;
          // updatePagination();
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
}

function prependNewLogs(logs) {
  const tableBody = document.getElementById("logsTable");
  const fragment = document.createDocumentFragment();

  logs.reverse().forEach((log) => {
    const row = document.createElement("tr");

    // ID column
    const idCell = document.createElement("td");
    idCell.textContent = log.id;
    idCell.style.textAlign = "center";
    idCell.style.verticalAlign = "middle";
    row.appendChild(idCell);

    // User column
    const userCell = document.createElement("td");
    const middleName = log.user?.middlename ? ` ${log.user.middlename}` : "";
    userCell.innerHTML = `${log.user?.firstname || ""}${middleName} ${
      log.user?.lastname || ""
    } `;
    userCell.style.textAlign = "center";
    userCell.style.verticalAlign = "middle";
    userCell.style.whiteSpace = "nowrap";
    row.appendChild(userCell);

    // Action column
    const actionCell = document.createElement("td");
    actionCell.textContent = log.action;
    actionCell.style.verticalAlign = "middle";
    actionCell.style.textAlign = "center";
    row.appendChild(actionCell);

    // Details column
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

    fragment.prepend(row);
  });

  tableBody.prepend(fragment);
}

async function loadLogs(page = 1) {
  try {
    const response = await fetch(
      `${backendURL}/api/log?page=${page}&per_page=${logsPerPage}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );

    const data = await response.json();
    if (data.logs.length === 0) {
      document.getElementById(
        "logsTable"
      ).innerHTML = `<td colspan="4" class="text-center">No Logs Found.</td>`;
      return;
    }

    if (data.logs && Array.isArray(data.logs)) {
      const tableBody = document.getElementById("logsTable");
      tableBody.innerHTML = ""; // Clear existing logs

      // Add to existingLogIds only if loading first page
      if (page === 1) {
        existingLogIds = new Set(data.logs.map((log) => log.id));
      }

      data.logs.forEach((log) => {
        const row = document.createElement("tr");

        // ID column
        const idCell = document.createElement("td");
        idCell.textContent = log.id;
        idCell.style.textAlign = "center";
        idCell.style.verticalAlign = "middle";
        row.appendChild(idCell);

        // User column
        const userCell = document.createElement("td");
        const middleName = log.user?.middlename
          ? ` ${log.user.middlename}`
          : "";
        userCell.innerHTML = `${log.user?.firstname || ""}${middleName} ${
          log.user?.lastname || ""
        } `;
        userCell.style.textAlign = "center";
        userCell.style.verticalAlign = "middle";
        userCell.style.whiteSpace = "nowrap";
        row.appendChild(userCell);

        // Action column
        const actionCell = document.createElement("td");
        actionCell.textContent = log.action;
        actionCell.style.verticalAlign = "middle";
        actionCell.style.textAlign = "center";
        row.appendChild(actionCell);

        // Details column
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

        tableBody.appendChild(row);
      });

      setupPagination(data);
      currentPage = page;
    }
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
  // Load first page
  loadLogs(1);

  // Connect SSE
  connectSSE();
});

window.addEventListener("beforeunload", () => {
  if (eventSource) eventSource.close();
});
