import {
  backendURL,
  getCachedData,
  showToast,
  storeActivity,
  userId,
} from "../utils/utils.js";

const createMemberForm = document.getElementById("create_member_form");

if (createMemberForm) {
  createMemberForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileInput = createMemberForm.querySelector(
      'input[type="file"][name="id_pic"]'
    );
    const formData = new FormData(createMemberForm);

    // Client-side validation
    if (!fileInput?.files?.length) {
      showToast("Please select a profile picture", "danger");
      return;
    }

    const file = fileInput.files[0];
    if (file.size > 2 * 1024 * 1024) {
      showToast("File must be smaller than 2MB", "danger");
      return;
    }

    try {
      const response = await fetch(backendURL + "/api/member", {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          // Don't set Content-Type - let browser set it for FormData
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      showToast("Member created successfully!");

      storeActivity(
        userId,
        "Create Member",
        `Created Member: ${formData.get("first_name")} ${formData.get(
          "last_name"
        )} - (Registration Number:${formData.get("reg_no")}) `
      );
      createMemberForm.reset();
    } catch (error) {
      console.error("Upload error:", error);
      showToast(error.message || "Upload failed. Try again.", "danger");
    }
  });
}

const chapterData = await getCachedData("/api/chapter");

let chapterOptions = chapterData
  .map((chapter) => {
    let chapters = [
      chapter.region?.region,
      chapter.municipality?.municipality,
      chapter.province?.province,
      chapter.city?.city,
      chapter.barangay?.barangay,
    ]
      .filter((value) => value && value !== "None")
      .join(", ");

    return `<option value="${chapter.id}">${chapters}</option>`;
  })
  .join("");

document.getElementById("chapter_id").innerHTML =
  `<option value="">Select Chapter</option>` + chapterOptions;

document.getElementById("toggleSearch").addEventListener("click", function () {
  this.classList.toggle("active");

  if (this.classList.contains("active")) {
    searchInputs.forEach((input) => (input.style.display = "block"));
  } else {
    searchInputs.forEach((input) => (input.style.display = "none"));
  }
});
