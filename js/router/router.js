const token = sessionStorage.getItem("token");
const userType = localStorage.getItem("type");

function setRouter() {
  const path = window.location.pathname;

  console.log(path);

  switch (path) {
    case "/index.html":
    case "/create-external-users.html":
      if (token !== null && userType !== "external user") {
        window.location.pathname = "/dashboard.html";
      }
      break;

    case "/addmembers.html":
    case "/barangay.html":
    case "/chapters.html":
    case "/contributions.html":
    case "/createusers.html":
    case "/edituser.html":
    case "/dashboard.html":
    case "/logs.html":
    case "/masterlist.html":
    case "/member-profile.html":
    case "/municipalities.html":
    case "/profile.html":
    case "/provinces.html":
    case "/regionalchapter.html":
    case "/viewmembers.html":
    case "/viewusers.html":
    case "/manage-edit-requests.html":
      if (token === null || userType === "external user") {
        window.location.pathname = "/index.html";
      }
      break;

    case "/external-user-member-view.html":
    case "/chapter-members.html":
      if (userType !== "external user") {
        if (token === null) {
          window.location.pathname = "/index.html";
        } else {
          window.location.pathname = "/dashboard.html";
        }
      }
      break;

    default:
      break;
  }
}

export { setRouter };
