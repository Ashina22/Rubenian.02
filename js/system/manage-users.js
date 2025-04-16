import {
  backendURL,
  showToast,
  storeActivity,
  userId,
  userType,
} from "../utils/utils.js";

const searchInput = document.querySelector(".search-users");

let users = [];

async function fetchUsers() {
  try {
    const searchQuery = searchInput.value.trim();
    const queryParam = searchQuery
      ? `?search=${encodeURIComponent(searchQuery)}`
      : "";

    const response = await fetch(`${backendURL}/api/user${queryParam}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${await response.text()}`);
    }

    users = await response.json();
    renderUserByRole();
  } catch (error) {
    console.error("Error fetching users:", error);
    document.getElementById(
      "adminTable"
    ).innerHTML = `<tr><td colspan='8' class="text-center text-danger">Failed to load users.</td></tr>`;
    document.getElementById(
      "staffTable"
    ).innerHTML = `<tr><td colspan='8' class="text-center text-danger">Failed to load users.</td></tr>`;
  }
}

function renderUserByRole() {
  let adminHTML = "";
  let staffHTML = "";
  const timestamp = new Date().toISOString();

  for (let user of users) {
    const profilePicture =
      user.profile_picture !== null
        ? `${backendURL}/${user.profile_picture}`
        : "image/profile.jpg";

    if (parseInt(user.id) === parseInt(userId) && userType === "Admin") {
      document.querySelectorAll(".admin-access")[2].classList.remove("d-none");
      document.querySelectorAll(".admin-access")[2].classList.add("d-flex");
    } else {
      document.querySelectorAll(".admin-access")[3].classList.remove("d-none");
      document.querySelectorAll(".admin-access")[3].classList.add("d-flex");
    }

    const html = `<tr >
                    <td class="text-center">
                      <span>
                        <img src="${profilePicture}" class="rounded-circle" alt="Profile" style="width: 40px; height:40px" class="profile-img"/>
                      </span>
                    </td>
                    <td class="text-center">
                      <span>
                        ${user.firstname}${
      user.middlename ? ` ${user.middlename}` : ""
    } ${user.lastname}
                      </span>
                    </td>
                    <td class="text-center">${user.username}</td>
                    <td class="text-center">${user.department}</td>
                    <td class="text-center">${user.position}</td>
                    <td class="text-center"><small class="bg-secondary text-white py-1 px-2 rounded-3">${user.role.toLowerCase()}</small></td>
          ${
            userType === "Admin"
              ? `<td class="text-center">
        <a href="edituser.html?user-id=${user.id}">
          <button class="btn btn-sm edit text-white" style="background-color: rgb(37, 153, 134)">
            Edit
          </button>
        </a>
        ${
          parseInt(user.id) === parseInt(userId) || user.role === "Admin"
            ? ``
            : `<button class="btn btn-danger btn-sm deleteUser" data-id="${user.id}">
                Delete
              </button>`
        }
      </td>`
              : userType === "Staff" && parseInt(user.id) === parseInt(userId)
              ? `<td class="text-center">
        <a href="edituser.html?user-id=${user.id}">
          <button class="btn btn-sm edit text-white" style="background-color: rgb(37, 153, 134)">
            Edit
          </button>
        </a>
      </td>`
              : ``
          }
                  </tr>`;

    if (user.role === "Admin") {
      adminHTML += html;
    } else {
      staffHTML += html;
    }
  }

  document.getElementById("adminTable").innerHTML =
    adminHTML ||
    `<tr><td colspan='8' class="text-center">No admins found.</td></tr>`;
  document.getElementById("staffTable").innerHTML =
    staffHTML ||
    `<tr><td colspan='8' class="text-center">No staff found.</td></tr>`;
}

document.addEventListener("click", function (e) {
  if (e.target.closest(".deleteUser")) {
    const button = e.target.closest(".deleteUser");
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
      const response = await fetch(`${backendURL}/api/user/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization:
            "Bearer " + sessionStoragesessionStorage.getItem("token"),
        },
      });

      if (!response.ok) {
        console.error("Failed to delete chapter");
        // showToast
        showToast(`Failed to delete a user.`, "danger");
        return;
      }

      const data = await response.json();

      fetchUsers();
      showToast(`Successfully deleted a user.`);
      storeActivity(
        userId,
        "Delete User",
        `Deleted user account: ${data.data.username} (ID: ${data.data.id}, Name: ${data.data.firstname} ${data.data.lastname})`
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

fetchUsers();
searchInput.addEventListener("input", fetchUsers);
