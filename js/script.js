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
});

//chapters.html//
document.addEventListener("DOMContentLoaded", function () {
  // Add event listener to the "Add Chapter" button
  const addChapterBtn = document.querySelector(".btn-add");
  if (addChapterBtn) {
    addChapterBtn.addEventListener("click", function () {
      const addChapterModal = new bootstrap.Modal(
        document.getElementById("addChapterModal")
      );
      addChapterModal.show();
    });
  }
});

//profile.html//
/// Function to add a new child name input field
function addChildNameField() {
  const childrenContainer = document.querySelector(".row");
  const currentChildrenCount = document.querySelectorAll(
    'input[placeholder="Child Name"]'
  ).length;

  const newChildIndex = currentChildrenCount + 1;

  // Create a new column for the child name
  const newChildColumn = document.createElement("div");
  newChildColumn.className = "col-md-4 mb-3";

  // Create label
  const newLabel = document.createElement("label");
  newLabel.textContent = `Child ${newChildIndex}`;

  // Create input
  const newInput = document.createElement("input");
  newInput.type = "text";
  newInput.className = "form-control";
  newInput.placeholder = "Child Name";
  newInput.disabled = false; // Keep consistent with edit mode
  newInput.name = `child${newChildIndex}`;

  // Append label and input to the column
  newChildColumn.appendChild(newLabel);
  newChildColumn.appendChild(newInput);

  // Find the last child input section to insert after
  const lastChildInput = document.querySelector(".row .col-md-4:last-of-type");

  // Insert the new child column
  if (lastChildInput) {
    lastChildInput.after(newChildColumn);
  } else {
    // Fallback if no existing child inputs
    childrenContainer.appendChild(newChildColumn);
  }

  // Update the children count input
  const childrenCountInput = document.getElementById("childrenCount");
  childrenCountInput.value = newChildIndex;
}

// Get form and buttons
const profileForm = document.getElementById("profileForm");
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const addChildrenNamesBtn = document.getElementById("addChildrenNamesBtn");

// Edit button click handler
editBtn.addEventListener("click", function () {
  // Enable all input fields except file inputs
  const inputs = document.querySelectorAll('input:not([type="file"])');
  inputs.forEach((input) => {
    input.disabled = false;
  });

  // Show add children names button
  addChildrenNamesBtn.classList.remove("d-none");

  // Toggle buttons
  editBtn.classList.add("d-none");
  saveBtn.classList.remove("d-none");
  cancelBtn.classList.remove("d-none");
});

// Save button click handler
saveBtn.addEventListener("click", function (e) {
  // Prevent default form submission
  e.preventDefault();

  // Disable all input fields
  const inputs = document.querySelectorAll('input:not([type="file"])');
  inputs.forEach((input) => {
    input.disabled = true;
  });

  // Hide add children names button
  addChildrenNamesBtn.classList.add("d-none");

  // Toggle buttons back
  editBtn.classList.remove("d-none");
  saveBtn.classList.add("d-none");
  cancelBtn.classList.add("d-none");

  // Here you would typically add code to save the data
  // For now, this is a placeholder
  alert("Changes saved!");
});

// Cancel button click handler
cancelBtn.addEventListener("click", function () {
  // Disable all input fields
  const inputs = document.querySelectorAll('input:not([type="file"])');
  inputs.forEach((input) => {
    input.disabled = true;
  });

  // Hide add children names button
  addChildrenNamesBtn.classList.add("d-none");

  // Toggle buttons back
  editBtn.classList.remove("d-none");
  saveBtn.classList.add("d-none");
  cancelBtn.classList.add("d-none");
});

// Add event listener to the "Add Children Names" button
document
  .getElementById("addChildrenNamesBtn")
  .addEventListener("click", addChildNameField);
