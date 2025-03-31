import { backendURL } from "../utils/utils.js";

const searchInput = document.querySelector(".search-users");

let users = [];

async function fetchUsers() {
  try {
    const searchQuery = searchInput.value.trim(); // Get search value
    const queryParam = searchQuery
      ? `?search=${encodeURIComponent(searchQuery)}`
      : "";

    const response = await fetch(`${backendURL}/api/user${queryParam}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
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

  for (let user of users) {
    const profilePicture =
      user.profile_picture !== null
        ? `${backendURL}/${user.profile_picture}`
        : "image/profile.jpg";

    const html = `<tr >
                    <td class="text-center">
                      <a href="members-profile.html">
                        <img src="${profilePicture}" alt="Profile" style="width: 40px; height:40px" class="profile-img"/>
                      </a>
                    </td>
                    <td class="text-center">
                      <a href="members-profile.html">
                        ${user.firstname}${
      user.middlename ? ` ${user.middlename}` : ""
    } ${user.lastname}
                      </a>
                    </td>
                    <td class="text-center">${user.username}</td>
                    <td class="text-center">${user.department}</td>
                    <td class="text-center">${user.position}</td>
                    <td class="text-center">${user.role.toLowerCase()}</td>
                    <td class="text-center">
                      <a href="edituser.html">
                        <button class="btn btn-sm edit text-white" style="background-color: rgb(37, 153, 134)">
                          Edit
                        </button>
                      </a>
                      <button
                        class="btn btn-danger btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#deleteModal">
                        Delete
                      </button>
                    </td>
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

fetchUsers();

// Optional: Add event listener for live search
searchInput.addEventListener("input", fetchUsers);
