import { backendURL, showToast, userType } from "../utils/utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const editRequestsTable = document.getElementById("editRequestsTable");
  const changesModalBody = document.getElementById("changesModalBody");
  let selectedRequestId = null;
  let userEmail = null;

  // Fetch and display all edit requests
  function fetchData() {
    fetch(backendURL + "/api/edit-requests", {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => populateTable(data))
      .catch((err) => console.error("Error fetching edit requests:", err));
  }

  function populateTable(requests) {
    editRequestsTable.innerHTML = "";

    if (requests.length === 0) {
      editRequestsTable.innerHTML = `<td colspan="5" class="text-center">No edit request found.</td>`;
    }

    requests.forEach((req) => {
      const tr = document.createElement("tr");

      const memberName = req.member?.first_name + " " + req.member?.last_name;
      const requestedBy =
        req.external_user?.firstname + " " + req.external_user?.lastname;

      const viewLink = document.createElement("a");
      viewLink.href = "#";
      viewLink.dataset.bsToggle = "modal";
      viewLink.dataset.bsTarget = "#changesModal";
      viewLink.textContent = "View";
      viewLink.classList.add("viewChangesLink");
      viewLink.dataset.id = req.id;

      const tdView = document.createElement("td");
      tdView.className = "text-center";
      tdView.style.width = "100px";
      tdView.appendChild(viewLink);

      const tdStatus = document.createElement("td");
      tdStatus.className = "text-center";
      tdStatus.style.width = "120px";
      tdStatus.innerHTML = `<small class="bg-secondary-subtle py-1 px-3 rounded-3" style="border: 1px solid #259986">
        ${req.status.charAt(0).toUpperCase() + req.status.slice(1)}
      </small>`;

      const tdActions = document.createElement("td");
      tdActions.style.width = "170px";

      if (req.status === "pending" && userType === "Admin") {
        tdActions.innerHTML = `
          <div class="d-flex"><button class="btn btn-add btn-sm acceptRequest me-1" data-id="${req.id}" data-bs-toggle="modal" data-bs-target="#acceptModal">Approve</button>
          <button class="btn btn-danger btn-sm declineRequest" data-id="${req.id}">Decline</button></div>
        `;
      } else {
        tdActions.innerHTML = `<small>No action.</small>`;
      }

      tr.innerHTML = `
        <td>${memberName}</td>
        <td>${requestedBy}</td>
      `;

      tr.appendChild(tdView);
      tr.appendChild(tdStatus);
      tr.appendChild(tdActions);

      editRequestsTable.appendChild(tr);
    });

    attachEventListeners();
  }

  fetchData();

  function attachEventListeners() {
    document.querySelectorAll(".viewChangesLink").forEach((link) => {
      link.addEventListener("click", (e) => {
        const requestId = e.target.dataset.id;

        showChangesModal(requestId);
      });
    });

    document.querySelectorAll(".acceptRequest").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        selectedRequestId = e.target.dataset.id;
      });
    });

    document.getElementById("acceptButton").addEventListener("click", () => {
      if (!selectedRequestId) return;

      fetch(`${backendURL}/api/edit-requests/approve/${selectedRequestId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then(() => {
          bootstrap.Modal.getInstance(
            document.getElementById("acceptModal")
          ).hide();
        })
        .then(
          () => showToast("Request has been successfully approved."),
          fetchData()
        )
        .catch((err) => console.error("Error:", err));
    });

    document.querySelectorAll(".declineRequest").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const requestId = e.target.dataset.id;
        if (!confirm("Are you sure you want to decline this request?")) return;

        fetch(`${backendURL}/api/edit-requests/${requestId}/decline`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            Accept: "application/json",
          },
        })
          .then((res) => res.json())
          .then(() => location.reload())
          .catch((err) => console.error("Error declining request:", err));
      });
    });
  }

  function showChangesModal(requestId) {
    fetch(`${backendURL}/api/edit-requests/${requestId}`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const changes = JSON.parse(data.requested_changes);
        changesModalBody.innerHTML = "";

        if (!changes || Object.keys(changes).length === 0) {
          changesModalBody.innerHTML =
            "<p class='text-muted'>No changes requested.</p>";
          return;
        }

        for (const field in changes) {
          const { old, new: newVal } = changes[field];

          const item = document.createElement("div");
          item.classList.add("mb-3");

          item.innerHTML = `
          <strong>${field.replace(/_/g, " ").toUpperCase()}</strong><br>
          <span class="text-muted">Old: ${old}</span><br>
          <span class="text-success">New: ${newVal}</span>
        `;

          changesModalBody.appendChild(item);
        }
      })
      .catch((err) => {
        console.error("Error fetching request changes:", err);
        changesModalBody.innerHTML =
          "<p class='text-danger'>Failed to load changes.</p>";
      });
  }
});

const sendCreateAccountAccessForm = document.getElementById("sendEmailForm");

sendCreateAccountAccessForm.onsubmit = function (e) {
  e.preventDefault();

  sendCreateAccountAccessForm.querySelector(
    "button"
  ).innerText = `Sending an email...`;
  sendCreateAccountAccessForm.querySelector("button").disabled = true;

  const data = {
    email: document.getElementById("emailInput").value,
  };

  fetch(`${backendURL}/api/tokens`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((response) => {
      showToast("Create an account access link sent to email.", "success");
      sendCreateAccountAccessForm.reset();
      sendCreateAccountAccessForm.querySelector(
        "button"
      ).innerText = `Succesfully sent an email.`;

      setTimeout(() => {
        const button = sendCreateAccountAccessForm.querySelector("button");
        button.innerText = "Send";
        button.disabled = false;
      }, 1500);
    })
    .catch((err) => {
      console.error("Error sending access email:", err);
      const button = sendCreateAccountAccessForm.querySelector("button");
      button.innerText = "Send";
      button.disabled = false;
      bootstrap.Modal.getInstance(
        document.getElementById("sendEmailModal")
      ).hide();
      showToast("Failed to send email. Try again later.", "danger");
    });
};
