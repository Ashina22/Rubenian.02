import { backendURL, getCachedData } from "../utils/utils.js";

const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const addChildrenNamesBtn = document.getElementById("addChildrenNamesBtn");
const addBeneficiariesNamesBtn = document.getElementById(
  "addBeneficiariesNamesBtn"
);

const params = new URLSearchParams(window.location.search);
const memberId = params.get("member-id").split("?")[0];
console.log(memberId);

function cleanImageName(str) {
  return str.replace(/^[\d\s;.'/-]+/, "").trim(); // Removes leading symbols/numbers
}

function checkImageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(true); // Image exists
    img.onerror = () => resolve(false); // Image does not exist
  });
}

async function getValidImagePath(member) {
  const defaultImage = "image/profile.jpg";

  if (!member.id_pic) return defaultImage; // No image set

  const cleanedName = cleanImageName(member.id_pic);
  const originalPath = `${backendURL}/storage/images/${member.id_pic}`;
  const cleanedPath = `${backendURL}/storage/images/${cleanedName}`;

  // Check if cleanedPath exists first
  if (await checkImageExists(cleanedPath)) {
    return cleanedPath;
  }

  // Check if originalPath exists next
  if (await checkImageExists(originalPath)) {
    return originalPath;
  }

  // Fallback to default
  return defaultImage;
}

async function fetchMember() {
  const response = await fetch(backendURL + "/api/member/" + memberId, {
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });

  if (!response.ok) {
    console.error("Failed to fetch member");
    return;
  }
  const data = await response.json();

  localStorage.setItem("member-data", JSON.stringify(data.data));
  console.log(data.data);
  renderMember(data.data);
}

async function renderMember(member) {
  getValidImagePath(member).then((imagePath) => {
    function formatValue(value) {
      return value ? value : "None";
    }

    const regNoElements = document.querySelectorAll("#reg_no");

    document.getElementById("fullname").innerText = [
      member.first_name,
      member.middle_name,
      member.last_name,
      member.ext_name,
    ]
      .filter(Boolean)
      .join(" ");

    document.getElementById("first_name").value = formatValue(
      member.first_name
    );
    document.getElementById("last_name").value = formatValue(member.last_name);
    document.getElementById("middle_name").value = formatValue(
      member.middle_name
    );
    document.getElementById("ext_name").value = formatValue(member.ext_name);
    document.getElementById("email").value = member.email;

    if (regNoElements.length > 0) {
      regNoElements[0].innerText = `RICN : ${member.reg_no}`;
    }

    if (regNoElements.length > 1) {
      regNoElements[1].value = formatValue(member.reg_no);
    }

    document.getElementById("vol_no").value = formatValue(member.vol_no);
    document.getElementById("page_no").value = formatValue(member.page_no);
    document.getElementById("birth_date").value = member.birth_date || ""; // Keep empty for dates
    document.getElementById("birth_place").value = formatValue(
      member.birth_place
    );
    document.getElementById("nationality").value = formatValue(
      member.nationality
    );
    document.getElementById("sex").value = formatValue(member.sex);
    document.getElementById("religion").value = formatValue(member.religion);
    document.getElementById("occupation").value = formatValue(
      member.occupation
    );
    document.getElementById("contact_no").value = formatValue(
      member.contact_no
    );
    document.getElementById("civil_status").value = formatValue(
      member.civil_status
    );

    const residenceElements = document.querySelectorAll("#residence");

    if (residenceElements.length > 0) {
      residenceElements[0].innerText = member.residence;
    }

    if (residenceElements.length > 1) {
      residenceElements[1].value = formatValue(member.residence);
    }

    document.getElementById("spouse_name").value = member.spouse_name;
    document.getElementById("father_name").value = formatValue(
      member.father_name
    );
    document.getElementById("mother_name").value = formatValue(
      member.mother_name
    );
    document.getElementById("sss_no").value = formatValue(member.sss_no);
    document.getElementById("gsis_no").value = formatValue(member.gsis_no);
    document.getElementById("tax_no").value = formatValue(
      member.tax_no || member.tin
    );
    document.getElementById("tax_issue").value = formatValue(member.tax_issue);
    document.getElementById("tax_date").value = member.tax_date || "";
    document.getElementById("or_no").value = formatValue(member.or_no);
    document.getElementById("or_issue").value = formatValue(member.or_issue);
    document.getElementById("teller_name").value = formatValue(
      member.teller_name
    );
    document.getElementById("or_date").value = member.or_date;
    document.getElementById("philhealth_no").value = formatValue(
      member.philhealth_no
    );
    document.getElementById("hdmf_no").value = formatValue(member.hdmf_no);

    // Emergency Contact Details
    document.getElementById("emergency_name").value = formatValue(
      member.emergency_name
    );
    document.getElementById("emergency_contact").value = formatValue(
      member.emergency_contact
    );
    document.getElementById("emergency_address").value = formatValue(
      member.emergency_address
    );
    document.getElementById("chapter_id").value = formatValue(
      member.chapter_id
    );

    // Profile Image
    if (member.id_pic) {
      document.getElementById("profileImage").src = imagePath;
    }

    // Handle children fields dynamically
    const childrenContainer = document.getElementById("childrenContainer");
    childrenContainer.innerHTML = "";
    let childCount = 0;

    for (let i = 1; i <= 20; i++) {
      const childKey = `child${i}`;

      if (
        member.hasOwnProperty(childKey) &&
        member[childKey] &&
        member[childKey].trim() !== ""
      ) {
        // console.log(`Adding child: ${childKey} - ${member[childKey]}`); // Debugging

        childCount++;

        const childDiv = document.createElement("div");
        childDiv.className = "col-md-4 mb-3";

        childDiv.innerHTML = `
          <label>Child ${childCount}</label>
          <input
            type="text"
            id="${childKey}"
            name="${childKey}"
            class="form-control"
            value="${member[childKey]}"
            placeholder="Child Name"
            disabled
          />
        `;

        childrenContainer.appendChild(childDiv);
      }
    }

    // Handle beneficiary fields dynamically
    const beneficiariesContainer = document.getElementById(
      "beneficiariesContainer"
    );
    beneficiariesContainer.innerHTML = ""; // Clear previous beneficiary fields
    let beneficiaryCount = 0;
    const maxBeneficiaries = 5; // Set limit

    for (let i = 1; i <= maxBeneficiaries; i++) {
      const beneficiaryKey = `beneficiary${i}`;

      if (
        member.hasOwnProperty(beneficiaryKey) &&
        member[beneficiaryKey] &&
        member[beneficiaryKey].trim() !== ""
      ) {
        console.log(
          `Adding beneficiary: ${beneficiaryKey} - ${member[beneficiaryKey]}`
        ); // Debugging

        beneficiaryCount++;

        const beneficiaryDiv = document.createElement("div");
        beneficiaryDiv.className = "col-md-4 mb-3";

        beneficiaryDiv.innerHTML = `
      <label>Beneficiary ${beneficiaryCount}</label>
      <input
        type="text"
        id="${beneficiaryKey}"
        name="${beneficiaryKey}"
        class="form-control"
        value="${member[beneficiaryKey]}"
        placeholder="Beneficiary Name"
        disabled
      />
    `;

        beneficiariesContainer.appendChild(beneficiaryDiv);
      }
    }

    // Update children count
    document.getElementById("childrenCount").value = childCount;
  });
}

// submit form

const update_member_form = document.getElementById("member_form");
update_member_form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(update_member_form);

  formData.forEach((value, key) => console.log(key, value));

  formData.append("_method", "PUT");

  const response = await fetch(backendURL + "/api/member/" + memberId, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  // Update member details in the DOM
  const updatedMember = await response.json();
  console.log(updatedMember);
  renderMember(updatedMember);

  // Disable all input fields
  const inputs = document.querySelectorAll('input:not([type="file"])');
  console.log(inputs);
  inputs.forEach((input) => {
    input.disabled = true;
  });

  const selects = document.querySelectorAll("select");
  selects.forEach((select) => {
    select.disabled = true;
  });

  // Hide add children names button
  addChildrenNamesBtn.classList.add("d-none");
  addBeneficiariesNamesBtn.classList.add("d-none");

  // Toggle buttons back
  editBtn.classList.remove("d-none");
  saveBtn.classList.add("d-none");
  cancelBtn.classList.add("d-none");
});

const data = await getCachedData("/api/chapter");
console.log(data);

let chapterOptions = data
  .map((chapter) => {
    let location = [
      chapter.region?.region,
      chapter.municipality?.municipality,
      chapter.province?.province,
      chapter.city?.city,
      chapter.barangay?.barangay,
    ]
      .filter((value) => value && value !== "None")
      .join(", ");

    return `<option value="${chapter.id}">${location}</option>`;
  })
  .join("");

document.getElementById("chapter_id").innerHTML = chapterOptions;

fetchMember();
