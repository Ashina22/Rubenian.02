import { backendURL, storeActivity } from "../utils/utils.js";

const login_form = document.getElementById("login_form");

const headers = {
  Accept: "application/json",
  Authorization: "Bearer " + sessionStorage.getItem("token"),
};

login_form.onsubmit = async (e) => {
  e.preventDefault();

  const loginButton = document.querySelector("#login_form button");
  loginButton.disabled = true;

  const formData = new FormData(login_form);

  const loginResponse = await fetch(backendURL + "/api/login", {
    method: "POST",
    headers,
    body: formData,
  });

  const loginData = await loginResponse.json();

  // throw error
  if (!loginResponse.ok) {
    document.querySelector(".loader-container").classList.add("d-none");
    loginButton.disabled = false;
    loginButton.innerHTML = `Login`;
    alert(loginData.message);
    throw new Error(await loginResponse.text());
  }

  document.querySelector(".loader-container").classList.remove("d-none");

  if (loginResponse.ok) {
    sessionStorage.setItem("token", loginData.token);

    const profileResponse = await fetch(backendURL + "/api/show/profile", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });

    const profileData = await profileResponse.json();

    console.log(profileData);

    const profileId = profileData.id;
    const profilelink = profileData.profile_picture;
    const timestamp = new Date().toISOString();

    localStorage.setItem("id", `${profileId}.${timestamp.split("T")[1]}rii`);
    localStorage.setItem(
      "profile",
      `${profilelink}.${timestamp.split("T")[1]}rii`
    );

    localStorage.setItem("type", loginData.type);

    await storeActivity(
      profileId,
      "Logging In",
      `Logged In User: ${profileData.username} - (Name: ${profileData.firstname} ${profileData.lastname})`
    );

    const id = localStorage.getItem("id");

    console.log(id.split(".")[0]);

    if (profileData.role === "external user") {
      window.location.href = "/chapter-members.html";
    } else {
      window.location.href = "/dashboard.html";
    }

    login_form.reset();
  } else {
    alert(loginData.message);
  }

  loginButton.disabled = false;
  loginButton.innerHTML = `Login`;
};
