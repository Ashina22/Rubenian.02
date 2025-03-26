const backendURL = "http://localhost/rii-membership-backend/public";

function removeURLParams() {
    const newUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
}

function showToast(message, type = "primary", duration = 3000) {
    let toastContainer = document.getElementById("toastContainer");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toastContainer";
        toastContainer.className = "position-fixed top-0 start-50 translate-middle-x p-3";
        toastContainer.style.zIndex = "1050";
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-white bg-${type} border-0 fade show`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    toastContainer.appendChild(toast);

    const bootstrapToast = new bootstrap.Toast(toast);

    setTimeout(() => {
        bootstrapToast.hide();
        setTimeout(() => toast.remove(), 500); 
    }, duration);
}



export { backendURL, removeURLParams, showToast }