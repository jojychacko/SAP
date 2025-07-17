const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const detailsDiv = document.getElementById("details");

if (!id) {
  detailsDiv.innerHTML = "<p>Missing employee ID.</p>";
} else {
  loadEmployee(id);
}

async function loadEmployee(empId) {
  const empRes = await fetch(`/odata/v4/OnboardingService/Employees(${empId})`);
  const emp = await empRes.json();

  const docsRes = await fetch(`/odata/v4/OnboardingService/Documents?$filter=employee_ID_ID eq ${empId}`);
  const docs = await docsRes.json();
  const doc = docs.value[0];

  const content = `
    <h2>${emp.name}</h2>
    <p><strong>Email:</strong> ${emp.email}</p>
    <p><strong>Department:</strong> ${emp.department}</p>
    <p><strong>Join Date:</strong> ${emp.joinDate}</p>
    <p><strong>Status:</strong> ${emp.status}</p>
    <p><strong>Role:</strong> ${emp.role || "-"}</p>
    ${doc ? `<p><strong>Resume:</strong> <a href="#" onclick="downloadFile('${doc.ID}')">${doc.filename}</a></p>` : "<p><em>No resume uploaded</em></p>"}
    <br>
    <button onclick="evaluateRole('${empId}')">Suggest Role</button>
    <button onclick="triggerApproval('${empId}')">Trigger Approval</button>
  `;

  detailsDiv.innerHTML = content;
}

async function evaluateRole(empId) {
  const res = await fetch(`/odata/v4/OnboardingService/evaluateRole`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeID: empId })
  });
  const result = await res.text();
  alert(result);
  location.reload();
}

async function triggerApproval(empId) {
  const res = await fetch(`/odata/v4/OnboardingService/triggerApproval`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeID: empId })
  });
  const result = await res.text();
  alert(result);
  location.reload();
}

async function downloadFile(docId) {
  const res = await fetch(`/odata/v4/OnboardingService/Documents(${docId})`);
  const doc = await res.json();

  const bytes = new Uint8Array(doc.content);
  const blob = new Blob([bytes], { type: doc.mimetype });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = doc.filename;
  a.click();
  URL.revokeObjectURL(url);
}
