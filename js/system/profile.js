import { backendURL, userId } from "../utils/utils.js";

// Pagination variables
let totalPages = 1;
let currentPage = 1;
let searchInputs = "";

document.getElementById(
  "placeholder"
).innerHTML = `<main class="content px-lg-3 py-2" style="margin-bottom: 10px">
  <div class="container-fluid">
    <div class="row g-2">
      <!-- Profile Section -->
      <div class="col-lg-4">
        <div class="card border-0">
          <div class="card-body text-center">
            <div class="avatar-container mb-3 skeleton-pulse">
              <div class="skeleton-image" style="width: 120px; height: 120px;"></div>
            </div>
            <h3 class="mb-2 skeleton-text" style="width: 70%; height: 28px"></h3>
            <p class="mb-3 skeleton-text" style="width: 50%; height: 20px"></p>

            <div class="user-details text-start">
              <div class="detail-item mb-3">
                <span class="skeleton-text" style="width: 30%; height: 16px"></span>
                <div class="skeleton-text" style="height: 20px"></div>
              </div>
              <div class="detail-item mb-3">
                <span class="skeleton-text" style="width: 30%; height: 16px"></span>
                <div class="skeleton-text" style="height: 20px"></div>
              </div>
              <div class="detail-item">
                <span class="skeleton-text" style="width: 30%; height: 16px"></span>
                <div class="skeleton-text" style="height: 20px"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Logs Section -->
      <div class="col-lg-8">
        <div class="card border-0 p-3">
          <div class="card-header border-bottom d-flex justify-content-between align-items-center">
            <h6 class="skeleton-text" style="width: 30%; height: 24px"></h6>
            <div class="search-container skeleton-pulse" style="width: 200px; height: 38px"></div>
          </div>
          <div class="card-body px-0">
            <div class="table-container">
              <table class="table table-borderless">
               
                <tbody>
                  <!-- Skeleton rows -->
                  <tr><td class="skeleton-text" style="height: 40px"></td><td></td><td></td></tr>
                  <tr><td class="skeleton-text" style="height: 40px"></td><td></td><td></td></tr>
                  <tr><td class="skeleton-text" style="height: 40px"></td><td></td><td></td></tr>
                  <tr><td class="skeleton-text" style="height: 40px"></td><td></td><td></td></tr>
                </tbody>
              </table>
              <nav aria-label="Page navigation">
                <ul class="pagination justify-content-center skeleton-pulse">
                  <li class="page-item" style="width: 120px; height: 38px"></li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>`;

// Initial skeleton loader
document.getElementById("placeholder").innerHTML = `
  <!-- Your skeleton loader HTML remains the same -->
`;

// Modified fetchData function with proper pagination handling
async function fetchData(page = 1) {
  try {
    const profileResponse = await fetch(backendURL + "/api/show/profile", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });

    const profileData = await profileResponse.json();
    console.log(profileData);

    const response = await fetch(
      `${backendURL}/api/logs/${profileData.id}?page=${page}&search=${searchInputs}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
      }
    );

    const data = await response.json();
    console.log(data);

    renderUser(profileData);
    renderLogs(data.logs);
    setupPagination(data);
  } catch (err) {
    console.error("Failed to fetch data:", err);
  }
}

// Improved setupPagination function
function setupPagination(data) {
  totalPages = data.last_page;
  currentPage = data.current_page;

  const paginationContainer = document.querySelector(".pagination");
  if (!paginationContainer) {
    console.error("Pagination container not found");
    return;
  }

  paginationContainer.innerHTML = "";

  // Previous Button
  const prevLi = document.createElement("li");
  prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
  prevLi.innerHTML = `<a class="page-link" href="#" data-page="${
    currentPage - 1
  }">Previous</a>`;
  paginationContainer.appendChild(prevLi);

  // Page Numbers
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = startPage + maxVisiblePages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // First page and ellipsis if needed
  if (startPage > 1) {
    const firstLi = document.createElement("li");
    firstLi.className = "page-item";
    firstLi.innerHTML = `<a class="page-link" href="#" data-page="1">1</a>`;
    paginationContainer.appendChild(firstLi);

    if (startPage > 2) {
      const ellipsisLi = document.createElement("li");
      ellipsisLi.className = "page-item disabled";
      ellipsisLi.innerHTML = `<span class="page-link">...</span>`;
      paginationContainer.appendChild(ellipsisLi);
    }
  }

  // Middle pages
  for (let i = startPage; i <= endPage; i++) {
    const pageLi = document.createElement("li");
    pageLi.className = `page-item ${i === currentPage ? "active" : ""}`;
    pageLi.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
    paginationContainer.appendChild(pageLi);
  }

  // Last page and ellipsis if needed
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsisLi = document.createElement("li");
      ellipsisLi.className = "page-item disabled";
      ellipsisLi.innerHTML = `<span class="page-link">...</span>`;
      paginationContainer.appendChild(ellipsisLi);
    }

    const lastLi = document.createElement("li");
    lastLi.className = "page-item";
    lastLi.innerHTML = `<a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>`;
    paginationContainer.appendChild(lastLi);
  }

  // Next Button
  const nextLi = document.createElement("li");
  nextLi.className = `page-item ${
    currentPage === totalPages ? "disabled" : ""
  }`;
  nextLi.innerHTML = `<a class="page-link" href="#" data-page="${
    currentPage + 1
  }">Next</a>`;
  paginationContainer.appendChild(nextLi);

  // Add event listeners to all page links
  document.querySelectorAll(".pagination .page-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const page = parseInt(this.getAttribute("data-page"));
      if (page !== currentPage) {
        currentPage = page;
        fetchData(currentPage);
      }
    });
  });
}

// Render functions remain the same
function renderUser(userData) {
  document.querySelector(".userDetails").classList.remove("d-none");
  document.getElementById(
    "fullName"
  ).textContent = `${userData.firstname} ${userData.lastname}`;
  document.getElementById("position").textContent = userData.position;
  document.getElementById("username").textContent = userData.username;
  document.getElementById("email").textContent = userData.email;
  document.getElementById("department").textContent = userData.department;

  const profileImg = document.getElementById("profilePicture");
  const profilePicture = backendURL + "/" + userData.profile_picture;
  profileImg.src = profilePicture;
}

function renderLogs(logsData) {
  document.querySelector(".logsDetails").classList.remove("d-none");
  document.getElementById("placeholder").innerHTML = "";

  const logsBody = document.getElementById("logsBody");
  logsBody.innerHTML = "";

  if (logsData.length === 0) {
    logsBody.innerHTML = `<tr class="text-center"><td colspan="3">No logs found.</td></tr>`;
    return;
  }

  logsData.forEach((log) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${new Date(log.created_at).toLocaleString()}</td>
      <td><span style="color: #259986;">${log.action}</span></td>
      <td>${log.details}</td>
    `;
    logsBody.appendChild(row);
  });
}

// Search functionality
document.querySelector("#searchInput").addEventListener("input", function () {
  searchInputs = this.value;
  currentPage = 1; // Reset to first page when searching
  fetchData(currentPage);
});

// Initial fetch
fetchData(currentPage);
