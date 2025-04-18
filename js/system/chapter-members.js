import { backendURL, showToast } from "../utils/utils.js";

const membersList = document.getElementById("membersTable");
const paginationContainer = document.querySelector(".pagination");
const rowsSelect = document.getElementById("rows");

let currentPage = 1;
let totalPages = 1;
let perPage = 10;
let searchQuery = "";

const profileResponse = await fetch(backendURL + "/api/show/profile", {
  headers: {
    Accept: "application/json",
    Authorization: "Bearer " + sessionStorage.getItem("token"),
  },
});

const profile = await profileResponse.json();
const chapterList = profile.chapter_id;

// Fetch Members with Pagination
async function fetchMembers() {
  let endpoint = "/api/members";

  endpoint += `?list=${chapterList}&page=${currentPage}&per_page=${perPage}`;

  if (searchQuery.trim() !== "") {
    endpoint += `&search=${encodeURIComponent(searchQuery)}`;
  }

  const response = await fetch(backendURL + endpoint, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    console.error("Failed to fetch members");
    return;
  }

  const data = await response.json();

  if (data.data.length === 0) {
    membersList.innerHTML = `<tr class="text-center"><td colspan="7">No members found.</td></tr>`;
    return;
  }

  displayMembers(data.data);
  setupPagination(data);
}

// Display Members in Table
function displayMembers(members) {
  membersList.innerHTML = "";

  members.sort((a, b) => a.page_no - b.page_no);

  members.forEach((member) => {
    const timestamp = new Date().toISOString();

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <a href="external-user-member-view.html?member-id=${
          member.id
        }?${timestamp}">
          ${member.first_name} ${
      member.middle_name ? member.middle_name : ``
    } ${member.last_name}  
          ${member.ext_name ? member.ext_name : ``}
        </a>
      </td>

      <td>${member.reg_no}</td>
      <td>${member.vol_no}</td>
      <td>${member.page_no}</td>
      <td>${member.residence}</td>
      <td class="text-center" ><small class="bg-secondary-subtle py-1 px-3 rounded-3" style="border: 1px solid #259986">${
        member.status || `Active`
      }</small></td>
    `;

    // Append row to members list
    membersList.appendChild(row);
  });
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
    // if (startPage > 2) {
    //   paginationContainer.innerHTML += `
    //     <li class="page-item disabled"><span class="page-link">...</span></li>
    //   `;
    // }
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
        <li class="page-item disabled"><span class="page-link" style="margin-left: -20px; margin-right: -20px">...</span></li>
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

// Change Page Function
window.changePage = function (page) {
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  fetchMembers();
};

// Search Event Listener

// Get DOM elements
const searchForm = document.getElementById("search_form");
const searchInput = document.querySelector(".search-members"); // Make sure this matches your input ID

// Debounce function to limit rapid API calls
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// Unified search handler
const handleSearch = () => {
  searchQuery = searchInput.value.trim();
  currentPage = 1; // Reset to first page

  // Only search if query length is 0 or > 10 characters
  if (searchQuery.length === 0 || searchQuery.length > 10) {
    fetchMembers();
  }
};

// Debounced version (300ms delay)
const debouncedSearch = debounce(handleSearch, 100);

// Event listeners
if (searchForm) {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    searchQuery = searchInput.value.trim();
    fetchMembers();
  });
}

if (searchInput) {
  // Trigger search while typing (debounced)
  searchInput.addEventListener("input", debouncedSearch);

  // Optional: Clear search when empty
  searchInput.addEventListener("input", () => {
    if (searchInput.value.trim() === "") {
      searchQuery = "";
      currentPage = 1;
      fetchMembers();
    }
  });
}

// Initial Fetch
fetchMembers();

if (rowsSelect) {
  console.log(rowsSelect);
  rowsSelect.addEventListener("change", function (e) {
    perPage = parseInt(e.target.value);
    currentPage = 1;
    fetchMembers();
  });

  // Set initial value to match the perPage variable
  rowsSelect.value = perPage;
}

// Open Modal
document.getElementById("exportBtn").addEventListener("click", function () {
  const modal = document.getElementById("exportModal");
  modal.style.display = "flex";

  // Set default filename with today's date
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById("exportFilename").value = document
    .getElementById("exportFilename")
    .value.replace("YYYY-MM-DD", today);
});

// Close Modal
document.getElementById("cancelExport").addEventListener("click", function () {
  document.getElementById("exportModal").style.display = "none";
});

document
  .getElementById("confirmExport")
  .addEventListener("click", async function () {
    const limit = document.getElementById("exportLimit").value.trim();
    const columns = document.getElementById("exportColumns").value.trim();
    const search = document.getElementById("exportSearch").value.trim();
    let filename = document.getElementById("exportFilename").value.trim();

    // Validate required fields
    if (!limit) {
      showToast("Please enter a row limit (number or 'all')", "danger");
      return;
    }

    console.log(limit);

    // Default filename if empty
    if (!filename) {
      filename = `members_export_${new Date().toISOString().slice(0, 10)}.csv`;
    } else if (!filename.toLowerCase().endsWith(".csv")) {
      filename += ".csv";
    }

    try {
      // Ensure chapterList is properly formatted
      let chapterIds = chapterList;
      if (Array.isArray(chapterList)) {
        chapterIds = chapterList.join(",");
      } else if (typeof chapterList === "string") {
        // Already in correct format
      } else {
        chapterIds = "";
      }

      // Prepare request payload
      const payload = {
        limit: limit === "all" ? null : parseInt(limit),
        columns: columns,
        filters: {
          chapter_ids: chapterIds,
          search: search,
        },
        filename: filename,
      };

      // Make API request
      const response = await fetch(`${backendURL}/api/members/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Export failed" }));
        throw new Error(error.message || "Export failed");
      }

      // Handle file download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      // Close modal
      document.getElementById("exportModal").style.display = "none";
      showToast("Export started successfully", "success");
    } catch (error) {
      console.error("Export failed:", error);
      showToast(`Export failed: ${error.message}`, "danger");
    }
  });
