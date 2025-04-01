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
      console.log("Image URL:", data.data.image_url);

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
// // Verify the file is included in FormData
// const fileInput = createMemberForm.querySelector(
//   'input[type="file"][name="id_pic"]'
// );
// if (fileInput && fileInput.files.length > 0) {
//   console.log("File found:", fileInput.files[0].name);
// } else {
//   console.warn("No file selected for id_pic");
//   // Either show an error or continue without file
//   // return showToast("ID picture is required", "danger");
// }

// try {
//   const response = await fetch(url, {
//     method: "POST",
//     headers: {
//       Accept: "application/json",
//       Authorization: `Bearer ${localStorage.getItem("token")}`,
//     },
//     body: formData,
//   });

//   const responseData = await response.json(); // Always parse JSON

//   if (!response.ok) {
//     showToast(
//       responseData.message || "Failed to create. Try again.",
//       "danger"
//     );
//     throw new Error(`POST request failed: ${JSON.stringify(responseData)}`);
//   }

//   showToast("Successfully created a new entry.");
//   createMemberForm.reset();
//   return responseData;
// } catch (error) {
//   console.error("Error:", error);
//   return null;
// }

const chapterData = await getCachedData("/api/chapter");
console.log(chapterData);

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
    console.log("Toggle ON");
    searchInputs.forEach((input) => (input.style.display = "block"));
  } else {
    console.log("Toggle OFF");
    searchInputs.forEach((input) => (input.style.display = "none"));
  }
});
