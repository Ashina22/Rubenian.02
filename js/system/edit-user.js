import {
  backendURL,
  showToast,
  storeActivity,
  userId,
} from "../utils/utils.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("user-id").split(".")[0];
console.log(id);

async function fetchUser() {
  const response = await fetch(backendURL + "/api/user/" + id, {
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });

  if (!response.ok) {
    console.error("Failed to fetch user");
    return;
  }
  const data = await response.json();

  console.log(data);
  renderUserData(data);
}

function renderUserData(data) {
  function formatValue(value) {
    return value ? value : "None";
  }

  document.getElementById("firstname").value = formatValue(data.firstname);
  document.getElementById("middlename").value = formatValue(data.middle);
  document.getElementById("lastname").value = formatValue(data.lastname);
  document.getElementById("department").value = formatValue(data.department);
  document.getElementById("position").value = formatValue(data.position);
  document.getElementById("username").value = formatValue(data.username);
  document.getElementById("email").value = formatValue(data.email);
  document.getElementById("role").value = formatValue(data.role);
}

document
  .getElementById("update_user_form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(document.getElementById("update_user_form"));
    const url = backendURL + "/api/user/" + id;

    // Simulate a PUT request
    formData.append("_method", "PUT");

    // Log formData for debugging
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: formData,
      });

      if (!response.ok) {
        console.error("Failed to update user");
        throw new Error(await response.text());
      }

      const data = await response.json();
      console.log(data);
      showToast("User updated successfully!");

      await storeActivity(
        userId,
        "Update User",
        `Updated User: ${formData.get("username")} - (Name: ${formData.get(
          "firstname"
        )} ${formData.get("lastname")})`
      );

      window.location.href = "/viewusers.html";
    } catch (error) {
      console.error("Error:", error);
    }
  });

fetchUser();
