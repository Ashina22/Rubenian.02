// Theme Toggle Functionality
const themeToggle = {
  init() {
    document
      .querySelector(".theme-toggle")
      .addEventListener("click", this.toggleTheme.bind(this));
    if (this.isLight()) this.applyLightTheme();
  },

  toggleTheme() {
    this.toggleLocalStorage();
    this.toggleRootClass();
  },

  toggleRootClass() {
    const current = document.documentElement.getAttribute("data-bs-theme");
    const inverted = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-bs-theme", inverted);
  },

  toggleLocalStorage() {
    if (this.isLight()) {
      localStorage.removeItem("light");
      this.swapTextClasses("text-light", "text-dark");
    } else {
      localStorage.setItem("light", "set");
      this.swapTextClasses("text-dark", "text-light");
    }
  },

  isLight() {
    return localStorage.getItem("light");
  },

  applyLightTheme() {
    this.toggleRootClass();
  },

  swapTextClasses(removeClass, addClass) {
    document.querySelectorAll(`.${removeClass}`).forEach((element) => {
      element.classList.remove(removeClass);
      element.classList.add(addClass);
    });
  },
};

// Sidebar Toggle
const sidebarToggle = document.querySelector("#sidebar-toggle");
sidebarToggle.addEventListener("click", () => {
  document.querySelector("#sidebar").classList.toggle("collapsed");
});

// Initialize theme
if (localStorage.getItem("light") === null) {
  themeToggle.swapTextClasses("text-light", "text-dark");
}
themeToggle.init();

// Profile Form Management
const profileManager = {
  init() {
    if (window.location.pathname.includes("createusers.html")) return;

    this.cacheElements();
    this.setupEventListeners();
  },

  cacheElements() {
    this.elements = {
      editBtn: document.getElementById("editBtn"),
      saveBtn: document.getElementById("saveBtn"),
      cancelBtn: document.getElementById("cancelBtn"),
      editPhotoSection: document.getElementById("editPhotoSection"),
      photoInput: document.getElementById("photoInput"),
      profileImage: document.getElementById("profileImage"),
      formFields: document.querySelectorAll(
        "#member_form input, #member_form select"
      ),
      noteElement: document.getElementById("note"),
      searchElement: document.getElementById("chapterSearch"),
      toggleElement: document.getElementById("toggleSearch"),
      addChildrenBtn: document.getElementById("addChildrenNamesBtn"),
      addBeneficiariesBtn: document.getElementById("addBeneficiariesNamesBtn"),
    };
  },

  setupEventListeners() {
    this.elements.editBtn.addEventListener(
      "click",
      this.enableEditMode.bind(this)
    );
    this.elements.cancelBtn.addEventListener(
      "click",
      this.disableEditMode.bind(this)
    );
    this.elements.photoInput.addEventListener(
      "change",
      this.handleImagePreview.bind(this)
    );
    this.elements.addChildrenBtn.addEventListener(
      "click",
      this.addChildNameField.bind(this)
    );
    this.elements.addBeneficiariesBtn.addEventListener(
      "click",
      this.addBeneficiaryNameField.bind(this)
    );
  },

  enableEditMode() {
    this.toggleFormFields(false);
    this.toggleElements(true);
  },

  disableEditMode() {
    this.toggleFormFields(true);
    this.toggleElements(false);
    this.elements.photoInput.value = "";
  },

  toggleFormFields(disabled) {
    this.elements.formFields.forEach((field) => (field.disabled = disabled));
  },

  toggleElements(show) {
    const action = show ? "remove" : "add";

    this.elements.saveBtn.classList[action]("d-none");
    this.elements.cancelBtn.classList[action]("d-none");
    this.elements.editBtn.classList[show ? "add" : "remove"]("d-none");
    this.elements.editPhotoSection.classList[action]("d-none");
    this.elements.addChildrenBtn.classList[action]("d-none");
    this.elements.addBeneficiariesBtn.classList[action]("d-none");

    [
      this.elements.noteElement,
      this.elements.searchElement,
      this.elements.toggleElement,
    ].forEach((el) => el && el.classList[action]("d-none"));
  },

  handleImagePreview() {
    const file = this.elements.photoInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => (this.elements.profileImage.src = e.target.result);
      reader.readAsDataURL(file);
    }
  },

  addInputField(
    containerSelector,
    placeholderText,
    maxCount,
    namePrefix,
    countInputId
  ) {
    const container = document.querySelector(containerSelector);
    const currentCount = document.querySelectorAll(
      `input[placeholder="${placeholderText}"]`
    ).length;

    if (currentCount >= maxCount) {
      alert(`Maximum number of ${namePrefix}s reached (${maxCount}).`);
      return;
    }

    const newIndex = currentCount + 1;
    const newColumn = document.createElement("div");
    newColumn.className = "col-md-4 mb-3";

    newColumn.innerHTML = `
      <label>${
        namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1)
      } ${newIndex}</label>
      <input type="text" class="form-control" placeholder="${placeholderText}" 
             disabled="${this.elements.editBtn.classList.contains("d-none")}" 
             name="${namePrefix}${newIndex}">
    `;

    const lastInput = container.querySelector(".col-md-4:last-of-type");
    lastInput ? lastInput.after(newColumn) : container.appendChild(newColumn);

    document.getElementById(countInputId).value = newIndex;
  },

  addChildNameField() {
    this.addInputField(
      "#childrenContainer",
      "Child Name",
      20,
      "child",
      "childrenCount"
    );
  },

  addBeneficiaryNameField() {
    this.addInputField(
      "#beneficiariesContainer",
      "Beneficiary Name",
      5,
      "beneficiary",
      "beneficiaryCount"
    );
  },
};

// Initialize profile manager if on profile page
if (!window.location.pathname.includes("createusers.html")) {
  profileManager.init();
}
