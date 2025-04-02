import { backendURL, userId } from "../utils/utils.js";

// Add these variables at the top of your script
let totalPages = 1;
let currentPage = 1;
const paginationContainer = document.querySelector(".pagination");

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

// Modified fetchData function with pagination
async function fetchData(page = 1) {
  try {
    const profileResponse = await fetch(backendURL + "/api/show/profile", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const profileData = await profileResponse.json();

    const response = await fetch(
      `${backendURL}/api/logs/${userId}?page=${page}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    const data = await response.json();

    renderUser(profileData);
    renderLogs(data.logs);
    setupPagination(data);
  } catch (err) {
    console.error("Failed to fetch data:", err);
  }
}

// Your existing setupPagination function
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
  fetchData();
};
function renderUser(userData) {
  // Populate profile
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

// Modified renderLogs function to clear existing content
function renderLogs(logsData) {
  document.querySelector(".logsDetails").classList.remove("d-none");
  document.getElementById("placeholder").innerHTML = "";

  const logsBody = document.getElementById("logsBody");
  logsBody.innerHTML = ""; // Clear existing content

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

// Initial fetch
fetchData();
