const token = localStorage.getItem("token");

function setRouter() {
  const path = window.location.href;
  const path2 = window.location.pathname;

  console.log(path || path2);

  switch (path) {
    case "/index.html":
      if (token !== null) {
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
      if (token === null) {
        window.location.pathname = "/index.html";
      }
      break;

    default:
      break;
  }
}

export { setRouter };
