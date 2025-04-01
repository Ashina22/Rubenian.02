import {
  backendURL,
  showToast,
  storeActivity,
  userId,
} from "../utils/utils.js";

// DOM Elements
const tableBody = document.getElementById("contributionsTable");
const searchInput = document.getElementById("searchInput");
const paginationContainer = document.querySelector(".pagination");

// State
let currentPage = 1;
let totalPages = 1;
let currentSearch = "";
let sortField = "contribution_date";
let sortDirection = "desc";

// Initialize
fetchContributions();

// Search handler with debounce
searchInput.addEventListener(
  "input",
  debounce(() => {
    currentSearch = searchInput.value;
    currentPage = 1;
    fetchContributions();
  }, 300)
);

// Fetch contributions with pagination, search, and sorting
async function fetchContributions() {
  try {
    const params = new URLSearchParams({
      page: currentPage,
      search: currentSearch,
      sort_field: sortField,
      sort_direction: sortDirection,
    });

    const response = await fetch(backendURL + `/api/contributions?${params}`);
    const { data, meta } = await response.json();

    console.log(data, meta);

    if (data.length === 0) {
      tableBody.innerHTML = `<td colspan="6" class="text-center">No Contributions Found.</td>`;
      return;
    }

    renderTable(data);
    setupPagination(meta);
  } catch (error) {
    console.error("Error fetching contributions:", error);
    alert("Failed to load contributions");
  }
}

// Render table rows
function renderTable(contributions) {
  tableBody.innerHTML = contributions
    .map((contribution) => {
      // Build chapter location string for each contribution
      const chapter = contribution.chapt;
      console.log(chapter);
      const chapters = [
        chapter?.region?.region,
        chapter?.municipality?.municipality,
        chapter?.province?.province,
        chapter?.city?.city,
        chapter?.barangay?.barangay,
      ]
        .filter((value) => value && value !== "None")
        .join(", ");

      // Build member name string if exists
      const memberName = contribution.member
        ? `${contribution.member.first_name} ${contribution.member.last_name}`
        : "N/A";

      // Determine what to show in the "Contributed By" column
      let contributedBy = "";
      if (contribution.member && chapters) {
        contributedBy = `${memberName} - ${chapters}`;
      } else if (contribution.member) {
        contributedBy = memberName;
      } else if (chapters) {
        contributedBy = chapters;
      } else {
        contributedBy = "N/A";
      }

      return `
        <tr>
          <td class="text-center">${contribution.name || "N/A"}</td>
          <td>${contributedBy}</td>
          <td>₱${contribution.amount?.toLocaleString() || "0"}</td>
          <td>${new Date(
            contribution.contribution_date
          ).toLocaleDateString()}</td>
          <td>${contribution.payment_method || "N/A"}</td>
          <td>${contribution.notes || "None"}</td>
        </tr>
      `;
    })
    .join("");
}

// Setup pagination (using your exact implementation)
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

  // First Page
  if (startPage > 1) {
    paginationContainer.innerHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="changePage(1)">1</a>
                </li>
            `;
  }

  // Page Numbers
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
            <li class="page-item ${
              currentPage === totalPages ? "disabled" : ""
            }">
                <a class="page-link" href="#" onclick="changePage(${
                  currentPage + 1
                })">Next</a>
            </li>
        `;
}

// Sort handler
function setupSorting() {
  document.querySelectorAll("th[data-sort]").forEach((header) => {
    header.addEventListener("click", () => {
      const field = header.dataset.sort;

      if (sortField === field) {
        sortDirection = sortDirection === "asc" ? "desc" : "asc";
      } else {
        sortField = field;
        sortDirection = "desc";
      }

      currentPage = 1;
      fetchContributions();
    });
  });
}

// Member search functionality with error handling
const memberSearch = document.getElementById("memberSearch");
if (memberSearch) {
  memberSearch.addEventListener(
    "input",
    debounce(function () {
      const searchTerm = this.value.trim();
      if (searchTerm.length < 2) return;

      fetch(
        backendURL + `/api/members?search=${encodeURIComponent(searchTerm)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
        .then((response) => {
          if (!response.ok) throw new Error("Network response was not ok");
          return response.json();
        })
        .then((data) => {
          const select = document.getElementById("memberSelect");
          if (select) {
            let optionsHTML = "";

            if (data.data && Array.isArray(data.data)) {
              optionsHTML += data.data
                .filter((member) => member && member.id)
                .map(
                  (member) =>
                    `<option value="${member.id}">
                    ${[member.first_name, member.last_name]
                      .filter(Boolean)
                      .join(" ")}
                  </option>`
                )
                .join("");
            }

            select.innerHTML = optionsHTML;
          }
        })
        .catch((error) => {
          console.error("Error fetching members:", error);
          showToast("Failed to load members", "danger");
        });
    }, 300)
  );
}

// Chapter search functionality with error handling
const chapterSearch = document.getElementById("chapterSearch");
if (chapterSearch) {
  chapterSearch.addEventListener(
    "input",
    debounce(function () {
      const searchTerm = this.value.trim();
      if (searchTerm.length < 2) return;

      fetch(
        backendURL + `/api/chapter?search=${encodeURIComponent(searchTerm)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
        .then((response) => {
          if (!response.ok) throw new Error("Network response was not ok");
          return response.json();
        })
        .then((data) => {
          const select = document.getElementById("chapterSelect");
          if (select) {
            let optionsHTML = "";

            console.log(data);

            if (data) {
              optionsHTML += data
                .filter((chapter) => chapter && chapter.id)
                .map((chapter) => {
                  const locationParts = [
                    chapter.barangay?.barangay,
                    chapter.city?.city,
                    chapter.municipality?.municipality,
                    chapter.province?.province,
                    chapter.region?.region,
                  ].filter((part) => part && part !== "None");

                  const locationText =
                    locationParts.join(", ") || "Unspecified Location";

                  return `<option value="${chapter.id}">${locationText}</option>`;
                })
                .join("");
            }

            select.innerHTML = optionsHTML;
          }
        })
        .catch((error) => {
          console.error("Error fetching chapters:", error);
          showToast("Failed to load chapters", "danger");
        });
    }, 300)
  );
}

// Form submission with error handling
const contributionForm = document.getElementById("create_contribution_form");
if (contributionForm) {
  contributionForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Show loading state
    const submitBtn = this.querySelector('[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

    const formData = new FormData(contributionForm);
    const data = Object.fromEntries(formData.entries());

    // loop through entries console logging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await fetch(backendURL + "/api/contributions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    console.log(responseData);

    if (!response.ok) {
      throw new Error(await response.text());
    }

    // Success case
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("addContributionModal")
    );
    if (modal) modal.hide();

    showToast("Contribution added successfully");

    storeActivity(
      userId,
      "Create Contribution",
      `Created Contribution: ${data.name} (Amount: ${data.amount}, Date: ${data.contribution_date}, Payment Method: ${data.payment_method})`
    );

    // Reset form and reload data
    contributionForm.reset();
    fetchContributions();

    // Reset button state
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}

// Debounce function
function debounce(func, timeout = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}
// Global changePage function
window.changePage = function (page) {
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  fetchContributions();
};

// Initialize sorting
setupSorting();

document.getElementById("toggleSearch").addEventListener("click", function () {
  this.classList.toggle("active");

  let searchInputs = document.querySelectorAll(".search-input");
  searchInputs.forEach((input) => (input.style.display = "none"));

  if (this.classList.contains("active")) {
    console.log("Toggle ON");
    searchInputs.forEach((input) => (input.style.display = "block"));
  } else {
    console.log("Toggle OFF");
    searchInputs.forEach((input) => (input.style.display = "none"));
  }
});
