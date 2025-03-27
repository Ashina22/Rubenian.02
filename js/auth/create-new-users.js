import { backendURL, removeURLParams, showToast } from "../utils/utils.js";

const form_register = document.getElementById("createUserForm");

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
  const response = await fetch(backendURL + "/api/create-user", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  if (!response.ok) {
    form_register.reset();
    document.querySelector("#createUserForm button").disabled = false;
    document.querySelector(
      "#createUserForm button "
    ).innerHTML = `<i class="fa-solid fa-user-plus me-2"></i>Create User`;
    showToast(`Failed to create new user. Try again.`, "danger");
    throw new Error(await response.text());
  }

  if (response.ok) {
    form_register.reset();
    showToast("Successfully created an account.", "success");
  }

  document.querySelector("#createUserForm button").disabled = false;
  document.querySelector(
    "#createUserForm button"
  ).innerHTML = `<i class="fa-solid fa-user-plus me-2"></i>Create User`;
  removeURLParams();
};
