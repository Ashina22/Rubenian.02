import { backendURL, removeURLParams, showToast } from "../utils/utils.js";

const form_register = document.getElementById("createUserForm");
const chapterSelect = document.getElementById("chapterSelect");

const params = new URLSearchParams(window.location.search);
const token = params.get("token");

const checkTokenResponse = await fetch(
  backendURL + "/api/checks/tokens/" + token,
  {
    headers: {
      Accept: "application/json",
    },
  }
);

const statusData = await checkTokenResponse.json();

async function fetchChapters() {
  try {
    const response = await fetch(backendURL + `/api/chapter`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch data");

    const chapterData = await response.json();

    displayChapters(chapterData);
  } catch (error) {
    console.error("Error fetching chapters:", error);
  }
}

function displayChapters(chapterData) {
  let chaptersHTML = chapterData
    .filter((_, index) => index !== 2) // Skip index 2
    .map((chapter) => {
      let chapters = [
        chapter.region?.region,
        chapter.municipality?.municipality,
        chapter.province?.province,
        chapter.city?.city,
        chapter.barangay?.barangay,
      ]
        .filter((value) => value && value !== "None")
        .join(", ");

      return `<option value="${chapter.id}">${chapters}</option>`;
    })
    .join("");

  chapterSelect.innerHTML = chaptersHTML;
}

if (statusData.status === "used" || !checkTokenResponse.ok) {
  const modalHTML = `
    <div class="modal fade show " id="invalidTokenModal" tabindex="-1" aria-modal="true" role="dialog" style="display: block; background: rgba(0, 0, 0, 0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger ">
            <h5 class="modal-title text-white">Invalid Access</h5>
          </div>
          <div class="modal-body text-center">
            <p>This page is not available. The token is either missing, invalid, or used.</p>
          </div>
          <div class="modal-footer">
            <a href="/index.html" class="btn btn-secondary">Go Home</a>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
} else {
  document.querySelector(".wrapper").classList.remove("d-none");
}

form_register.onsubmit = async (e) => {
  e.preventDefault();

  document.querySelector("#createUserForm button").disabled = true;
  document.querySelector(
    "#createUserForm button"
  ).innerHTML = ` <i class="fa-solid fa-user-plus me-2"></i> loading...`;

  const formData = new FormData(form_register);

  // loop sent data
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  formData.append("role", "external user");

  const response = await fetch(backendURL + "/api/create-external-user", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  const json = await response.json();

  if (!response.ok) {
    form_register.reset();
    document.querySelector("#createUserForm button").disabled = false;
    document.querySelector(
      "#createUserForm button "
    ).innerHTML = `<i class="fa-solid fa-user-plus me-2"></i>Create User`;
    showToast(`${json.message}. ${json.error}.`, "danger");
    throw new Error(await response.text());
  }

  if (response.ok) {
    form_register.reset();
    showToast("Successfully created an account.");
    await fetch(backendURL + "/api/markAsUsed/tokens/" + token, {
      headers: {
        Accept: "application/json",
      },
    });
  }

  document.querySelector("#createUserForm button").disabled = false;
  document.querySelector(
    "#createUserForm button"
  ).innerHTML = `<i class="fa-solid fa-user-plus me-2"></i>Create User`;
  removeURLParams();
  window.location.pathname = "/index.html";
};

document.getElementById("toggleSearch").addEventListener("click", function () {
  this.classList.toggle("active");

  let searchInputs = document.querySelectorAll(".search-input");
  console.log(searchInputs);

  if (this.classList.contains("active")) {
    searchInputs.forEach((input) => input.classList.remove("d-none"));
  } else {
    searchInputs.forEach((input) => input.classList.add("d-none"));
  }
});

fetchChapters();
