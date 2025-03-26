const sidebarToggle = document.querySelector("#sidebar-toggle");
sidebarToggle.addEventListener("click", function () {
  document.querySelector("#sidebar").classList.toggle("collapsed");
});

document.querySelector(".theme-toggle").addEventListener("click", () => {
  toggleLocalStorage();
  toggleRootClass();
});

function toggleRootClass() {
  const current = document.documentElement.getAttribute("data-bs-theme");
  const inverted = current == "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-bs-theme", inverted);
}

function toggleLocalStorage() {
  if (isLight()) {
    localStorage.removeItem("light");
  } else {
    localStorage.setItem("light", "set");
  }
}

function isLight() {
  return localStorage.getItem("light");
}

if (isLight()) {
  toggleRootClass();
}

//members-profile js//
document.addEventListener("DOMContentLoaded", function () {
  const editBtn = document.getElementById("editBtn");
  const saveBtn = document.getElementById("saveBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const editPhotoSection = document.getElementById("editPhotoSection");
  const photoInput = document.getElementById("photoInput");
  const profileImage = document.getElementById("profileImage");
  const formFields = document.querySelectorAll("#profileForm input");

  // Store the original image src to revert if cancelled
  const path = window.location.pathname;

  console.log(path)

  if(path !== '/createusers.html'){
  const originalImageSrc = profileImage.src;


  editBtn.addEventListener("click", function () {
    formFields.forEach((field) => (field.disabled = false));
    saveBtn.classList.remove("d-none");
    cancelBtn.classList.remove("d-none");
    editBtn.classList.add("d-none");
    editPhotoSection.classList.remove("d-none");
  });



  cancelBtn.addEventListener("click", function () {
    formFields.forEach((field) => (field.disabled = true));
    saveBtn.classList.add("d-none");
    cancelBtn.classList.add("d-none");
    editBtn.classList.remove("d-none");
    editPhotoSection.classList.add("d-none");
    profileImage.src = originalImageSrc; // Revert image preview
    photoInput.value = ""; // Clear file input
  });


  // Optional: Preview selected image immediately
  photoInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        profileImage.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Example submit event (You can handle backend processing here)
  document
    .getElementById("profileForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      alert("Profile saved successfully!");

      formFields.forEach((field) => (field.disabled = true));
      saveBtn.classList.add("d-none");
      cancelBtn.classList.add("d-none");
      editBtn.classList.remove("d-none");
      editPhotoSection.classList.add("d-none");
      // Note: You would need backend code to actually upload the photo
    });

  }

});





//chapters.html//
document.addEventListener('DOMContentLoaded', function() {
  // Add event listener to the "Add Chapter" button
  const addChapterBtn = document.querySelector('.btn-add');
  if (addChapterBtn) {
    addChapterBtn.addEventListener('click', function() {
      const addChapterModal = new bootstrap.Modal(document.getElementById('addChapterModal'));
      addChapterModal.show();
    });
  }
});