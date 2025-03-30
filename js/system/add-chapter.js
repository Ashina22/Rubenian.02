import { postData } from "../utils/utils.js";

const formMappings = [
  { id: "create_region_form", endpoint: "/api/region" },
  { id: "create_province_form", endpoint: "/api/province" },
  { id: "create_municipality_form", endpoint: "/api/municipality" },
  { id: "create_city_form", endpoint: "/api/city" },
  { id: "create_barangay_form", endpoint: "/api/barangay" },
  { id: "create_chapter_form", endpoint: "/api/chapter" },
];

formMappings.forEach(({ id, endpoint }) => {
  const form = document.getElementById(id);
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      postData(endpoint, formData, form);
    });
  }
});
