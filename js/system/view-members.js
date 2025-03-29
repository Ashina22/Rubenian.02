import { backendURL } from "../utils/utils.js";

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
  localStorage.setItem("chapter-list", list); // Store latest list
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

const userType = localStorage.getItem("type");

if (label) {
  chapterLabel.textContent = `${label} - Members`;
}

let currentPage = 1;
let totalPages = 1;
const perPage = 10;
let searchQuery = "";

// Fetch Members with Pagination
async function fetchMembers() {
  let endpoint =
    masterList === null
      ? `/api/members?list=${chapterList}&page=${currentPage}&per_page=${perPage}`
      : `/api/members?view-master-list&page=${currentPage}&per_page=${perPage}`;

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

  console.log(data);

  if (data.data.length === 0) {
    membersList.innerHTML = `<tr class="text-center"><td colspan="5">No members found.</td></tr>`;
    return;
  }

  console.log(data);
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
  const originalPath = `${backendURL}/storage/images/${member.id_pic}`;
  const cleanedPath = `${backendURL}/storage/images/${cleanedName}`;

  // Check if cleanedPath exists first
  if (await checkImageExists(cleanedPath)) {
    return cleanedPath;
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
      console.log("Final Image Path:", imagePath);

      //   console.log("New Name:", cleanedName, "Old Name:", member.id_pic);

      const timestamp = new Date().toISOString();

      const row = document.createElement("tr");
      row.innerHTML = `
      <td>
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
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteRow(this)" data-bs-toggle="modal" data-bs-target="#deleteModal">
          Delete
        </button>
      </td>
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
  let startPage = Math.max(1, currentPage - 2); // Ensure at least two pages before current page
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
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

  // First Page
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

  // Page Numbers (Dynamic Range)
  for (let i = startPage; i <= endPage; i++) {
    paginationContainer.innerHTML += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
      </li>
    `;
  }

  // Last Page
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

// Change Page Function
window.changePage = function (page) {
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  fetchMembers();
};

// Search Event Listener
search.addEventListener("input", () => {
  searchQuery = search.value;
  currentPage = 1; // Reset to page 1 when searching
  fetchMembers();
});

// Initial Fetch
fetchMembers();
