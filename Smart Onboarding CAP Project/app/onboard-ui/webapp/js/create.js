document.getElementById("onboardForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const department = document.getElementById("department").value;
    const joinDate = document.getElementById("joinDate").value;
    const fileInput = document.getElementById("resume");
    const file = fileInput.files[0];
  
    if (!file) return alert("Please upload a resume.");
  
    // Read file as base64 or binary
    const arrayBuffer = await file.arrayBuffer();
    const base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  
    // Step 1: Create employee
    const empRes = await fetch("/odata/v4/OnboardingService/Employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        department,
        joinDate,
      }),
    });
  
    const empData = await empRes.json();
    if (!empRes.ok) return alert("Error creating employee: " + empData.error?.message);
  
    // Step 2: Upload document
    const docRes = await fetch("/odata/v4/OnboardingService/Documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_ID_ID: empData.ID,
        filename: file.name,
        mimetype: file.type,
        content: base64ToBinary(base64Content),
      }),
    });
  
    const docData = await docRes.json();
    if (!docRes.ok) return alert("Error uploading resume: " + docData.error?.message);
  
    document.getElementById("message").innerText = "Onboarding Created Successfully!";
    document.getElementById("onboardForm").reset();
  });
  
  function base64ToBinary(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return Array.from(bytes); // Convert to JSON-safe array
  }
  