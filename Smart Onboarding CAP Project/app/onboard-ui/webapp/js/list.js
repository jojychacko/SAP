async function loadEmployees() {
    const res = await fetch("/odata/v4/OnboardingService/Employees");
    const data = await res.json();
    const table = document.querySelector("#employeeTable tbody");
    table.innerHTML = "";
  
    data.value.forEach(emp => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><a href="employee-detail.html?id=${emp.ID}">${emp.name}</a></td>
        <td>${emp.email}</td>
        <td>${emp.department}</td>
        <td>${emp.joinDate}</td>
        <td>${emp.status}</td>
        <td>${emp.role || "-"}</td>
        <td>
            <button onclick="evaluateRole('${emp.ID}')">Suggest Role</button>
            <button onclick="triggerApproval('${emp.ID}')">Trigger Approval</button>
        </td>
`;

      table.appendChild(row);
    });
  }
  
  async function evaluateRole(id) {
    const res = await fetch(`/odata/v4/OnboardingService/evaluateRole`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeID: id })
    });
    const result = await res.text();
    alert(result);
    loadEmployees();
  }
  
  async function triggerApproval(id) {
    const res = await fetch(`/odata/v4/OnboardingService/triggerApproval`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeID: id })
    });
    const result = await res.text();
    alert(result);
    loadEmployees();
  }
  
  loadEmployees();
  