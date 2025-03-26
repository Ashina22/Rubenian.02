import { backendURL } from "../utils/utils.js";

const login_form = document.getElementById("login_form");

const headers = {
  Accept: "application/json",
  Authorization: "Bearer " + localStorage.getItem("token"),
};


login_form.onsubmit = async (e) => {
  e.preventDefault();
  document.querySelector(".loader-container").classList.remove("d-none"); 

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
    alert(loginData.message)
    throw new Error(await loginResponse.text());
  }


  if (loginResponse.ok) {
    localStorage.setItem("token", loginData.token);
    localStorage.setItem("type", loginData.role);

    const profileId = loginData.id;
    const timestamp = new Date().toISOString(); 
    
    localStorage.setItem("id", `${profileId}?+./${timestamp}rii`);
    
    window.location.href = "/index.html";

    login_form.reset();
  } else {
    alert(loginData);
  }

  loginButton.disabled = false;
  loginButton.innerHTML = `Login`;
};