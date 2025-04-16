import { backendURL, getCachedData } from "../utils/utils.js";

const backToProfile = document.getElementById("back-member-profile");

// Get member ID from URL
const urlParams = new URLSearchParams(window.location.search);
const memberId = urlParams.get("id");
// const memberId = 2;

backToProfile.href = `/member-profile.html?member-id=${memberId}`;

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
  const originalPath = `${backendURL}/uploads/members/${member.id_pic}`;
  const anotherPath = `${backendURL}/${member.id_pic}`;
  const cleanedPath = `${backendURL}/${cleanedName || member.id_pic}`;
  const anotherCleanedPath = `${backendURL}/uploads/members/${
    cleanedName || member.id_pic
  }`;

  // Check if cleanedPath exists first
  if (await checkImageExists(cleanedPath)) {
    return cleanedPath;
  }

  // Check if cleanedPath exists first
  if (await checkImageExists(anotherCleanedPath)) {
    return anotherCleanedPath;
  }

  // Check if anotherPath exists first
  if (await checkImageExists(anotherPath)) {
    return anotherPath;
  }

  // Check if originalPath exists next
  if (await checkImageExists(originalPath)) {
    return originalPath;
  }

  // Fallback to default
  return defaultImage;
}

// Fetch member data from API
async function fetchMemberData() {
  try {
    const response = await fetch(backendURL + `/api/member/${memberId}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    if (data.success) {
      populateForm(data.data);
    } else {
      console.error("Member not found");
    }
  } catch (error) {
    console.error("Error fetching member data:", error);
  }
}

const chapterData = await getCachedData("/api/chapter");

// Populate form with member data
function populateForm(member) {
  getValidImagePath(member).then((imagePath) => {
    // Basic info
    document.getElementById("vol_no").textContent = member.vol_no || "-";
    document.getElementById("ricn").textContent = member.reg_no || "-";
    document.getElementById("page_no").textContent = member.page_no || "-";
    document.getElementById("date_reg").textContent = member.or_date || "-";

    // Personal info
    document.getElementById("last_name").textContent = member.last_name || "-";
    document.getElementById("first_name").textContent =
      member.first_name || "-";
    document.getElementById("middle_name").textContent =
      member.middle_name || "-";
    document.getElementById("ext_name").textContent = member.ext_name || "-";
    document.getElementById("sex").textContent = member.sex || "-";
    document.getElementById("birth_date").textContent =
      member.birth_date || "-";
    document.getElementById("birth_place").textContent =
      member.birth_place || "-";
    document.getElementById("civil_status").textContent =
      member.civil_status || "-";
    document.getElementById("residence").textContent = member.residence || "-";
    document.getElementById("contact_no").textContent =
      member.contact_no || "-";
    document.getElementById("occupation").textContent =
      member.occupation || "-";
    document.getElementById("religion").textContent = member.religion || "-";
    document.getElementById("nationality").textContent =
      member.nationality || "-";

    const chapterName = chapterData.find((ch) => ch.id === member.chapter_id);

    console.log(chapterName);

    if (!chapterName) {
      console.log("Chapter not found for member:", member.chapter_id);
      return "-";
    }

    const chapter = [
      chapterName.region?.region,
      chapterName.municipality?.municipality,
      chapterName.province?.province,
      chapterName.city?.city,
      chapterName.barangay?.barangay,
    ]
      .filter(Boolean)
      .filter((value) => value && value !== "None" && value !== "")
      .join(", ");

    console.log(chapter);

    document.getElementById("chapter").textContent =
      `${member.barangay},` + chapter || "-";
    document.getElementById("region").textContent = member.region || "-";

    // Family info
    document.getElementById("spouse_name").textContent =
      member.spouse_name || "-";
    document.getElementById("father_name").textContent =
      member.father_name || "-";
    document.getElementById("mother_name").textContent =
      member.mother_name || "-";

    // Emergency contact
    document.getElementById("emergency_name").textContent =
      member.emergency_name || "-";
    document.getElementById("emergency_contact").textContent =
      member.emergency_contact || "-";
    document.getElementById("emergency_address").textContent =
      member.emergency_address || "-";

    // Photo
    if (member.id_pic) {
      document.getElementById("member_photo").src = imagePath;
    }

    function isInvalidName(name) {
      return !name || !name.toString().trim();
    }

    // Populates table (removes if no valid data, strict 3-columns)
    function populateTable(tableId, dataKey, maxEntries) {
      const tableBody = document.getElementById(tableId);
      const tableContainer = tableBody.closest("table");
      const validNames = [];

      // Collect VALID names only
      for (let i = 1; i <= maxEntries; i++) {
        const name = member[`${dataKey}${i}`];
        if (!isInvalidName(name)) validNames.push(name.toString().trim());
      }

      // Remove table if no valid names
      if (validNames.length === 0) {
        tableContainer.remove();
        return;
      }

      // Build rows with exactly 3 columns (no gaps)
      tableBody.innerHTML = "";
      for (let i = 0; i < validNames.length; i += 3) {
        const row = tableBody.insertRow();
        for (let j = 0; j < 3 && i + j < validNames.length; j++) {
          const cell = row.insertCell();
          cell.textContent = validNames[i + j];
        }
      }
    }

    // Usage
    populateTable("childTable", "child", 20); // Children (max 20)
    populateTable("beneTable", "beneficiary", 5); // Beneficiaries (max 5)
  });
}

// Initialize on page load
if (memberId) {
  fetchMemberData();
} else {
  console.error("No member ID specified in URL");
}
