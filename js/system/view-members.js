import {
  backendURL,
  showToast,
  storeActivity,
  userId,
} from "../utils/utils.js";

const search = document.querySelector(".search-members");
const membersList = document.getElementById("membersTable");
const paginationContainer = document.querySelector(".pagination");
const chapterLabel = document.getElementById("chapter-label");

const params = new URLSearchParams(window.location.search);
let list = params.get("list");

// Restore list if missing when navigating back
if (!list) {
  list = localStorage.getItem("chapter-list");
  if (list) {
    params.set("list", list); // Re-add to URL
    window.history.replaceState(
      {},
      document.title,
      `${window.location.pathname}?${params.toString()}`
    );
  }
} else {
  localStorage.setItem("chapter-list", list);
  params.delete("list"); // Hide from URL
  window.history.replaceState(
    {},
    document.title,
    `${window.location.pathname}?${params.toString()}`
  );
}

const chapterList = localStorage.getItem("chapter-list");
const masterList = params.get("view-master-list");
const label = params.get("label");

if (label) {
  chapterLabel.textContent = `${label} - Members`;
}
const userType = localStorage.getItem("type");

let currentPage = 1;
let totalPages = 1;
const perPage = 10;
let searchQuery = "";

// Fetch Members with Pagination
async function fetchMembers() {
  let endpoint = "/api/members";

  if (masterList === null) {
    endpoint += `?list=${chapterList}&page=${currentPage}&per_page=${perPage}`;
  } else if (masterList !== null && label === null) {
    localStorage.setItem("chapter-list", "");
    endpoint += `?view-master-list&page=${currentPage}&per_page=${perPage}`;
  }

  if (searchQuery.trim() !== "") {
    endpoint += `&search=${encodeURIComponent(searchQuery)}`;
  }

  const response = await fetch(backendURL + endpoint, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    console.error("Failed to fetch members");
    return;
  }

  const data = await response.json();

  if (data.data.length === 0) {
    membersList.innerHTML = `<tr class="text-center"><td colspan="5">No members found.</td></tr>`;
    return;
  }

  displayMembers(data.data);
  setupPagination(data);
}

function cleanImageName(str) {
  return str.replace(/^[\d\s;.'/-]+/, "").trim(); // Removes leading symbols/numbers
}

function checkImageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(true); // Image exists
    img.onerror = () => resolve(false); // Image does not exist
  });
}

async function getValidImagePath(member) {
  const defaultImage = "image/profile.jpg";

  if (!member.id_pic) return defaultImage; // No image set

  const cleanedName = cleanImageName(member.id_pic);
  const originalPath = `${backendURL}/uploads/members/${member.id_pic}`;
  const anotherPath = `${backendURL}/${member.id_pic}`;
  const cleanedPath = `${backendURL}/${cleanedName || member.id_pic}`;
  const anotherCleanedPath = `${backendURL}/uploads/members/${
    cleanedName || member.id_pic
  }`;

  // Check if cleanedPath exists first
  if (await checkImageExists(cleanedPath)) {
    return cleanedPath;
  }

  // Check if cleanedPath exists first
  if (await checkImageExists(anotherCleanedPath)) {
    return anotherCleanedPath;
  }

  // Check if anotherPath exists first
  if (await checkImageExists(anotherPath)) {
    return anotherPath;
  }

  // Check if originalPath exists next
  if (await checkImageExists(originalPath)) {
    return originalPath;
  }

  // Fallback to default
  return defaultImage;
}

// Display Members in Table
function displayMembers(members) {
  membersList.innerHTML = "";

  members.sort((a, b) => a.page_no - b.page_no);

  members.forEach((member) => {
    getValidImagePath(member).then((imagePath) => {
      const timestamp = new Date().toISOString();

      const row = document.createElement("tr");
      row.innerHTML = `<td class="text-center">
        <a href="member-profile.html?member-id=${member.id}?${timestamp}">
          <img src="${imagePath}" alt="Profile" class="member-img"  />
        </a>
      </td>
      <td>
        <a href="member-profile.html?member-id=${member.id}?${timestamp}">
          ${member.first_name} ${
        member.middle_name ? member.middle_name : ``
      } ${member.last_name}  
          ${member.ext_name ? member.ext_name : ``}
        </a>
      </td>

      <td>${member.residence}</td>
      <td>${member.reg_no}</td>
      ${
        userType !== "Admin"
          ? ``
          : `<td>
        <button class="btn btn-danger btn-sm deleteMember" data-id=${member.id} >
          Delete
        </button>
      </td>`
      }
    `;

      // Append row to members list
      membersList.appendChild(row);
    });
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
const debouncedSearch = debounce(handleSearch, 300);

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

document.addEventListener("click", function (e) {
  if (e.target.closest(".deleteMember")) {
    const button = e.target.closest(".deleteMember");
    const id = button.getAttribute("data-id");

    // Set the delete button's data-id
    document.getElementById("deleteButton").dataset.id = id;

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

    try {
      const response = await fetch(`${backendURL}/api/member/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      if (!response.ok) {
        console.error("Failed to delete member");
        // showToast
        showToast(`Failed to delete a member.`, "danger");
        return;
      }

      const data = await response.json();

      fetchMembers();
      showToast(`Successfully deleted a member.`);

      storeActivity(
        userId,
        "Delete Member",
        `Deleted Member: ${data.data.first_name} ${data.data.last_name} - ${data.data.sex} - (Registration Number: ${data.data.reg_no})`
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

    if (masterList !== null && label === null) {
      localStorage.setItem("chapter-list", ``);
      const chapterList = ``;
      console.log(chapterList);
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
          Authorization: "Bearer " + localStorage.getItem("token"),
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
