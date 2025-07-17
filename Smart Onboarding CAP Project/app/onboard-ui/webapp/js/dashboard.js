async function fetchDashboardData() {
  const res = await fetch('/dashboard-data');
  return await res.json();
}

function renderBarChart(data) {
  const ctx = document.getElementById('barChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(data.byDepartment),
      datasets: [{
        label: 'Employees',
        data: Object.values(data.byDepartment),
        backgroundColor: '#c62828'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

function renderLineChart(data) {
  const ctx = document.getElementById('lineChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: Object.keys(data.joinersOverTime),
      datasets: [{
        label: 'Joiners',
        data: Object.values(data.joinersOverTime),
        fill: true,
        borderColor: '#c62828',
        backgroundColor: 'rgba(198, 40, 40, 0.2)',
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

function renderPieChart(data) {
  const ctx = document.getElementById('pieChart').getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(data.byStatus),
      datasets: [{
        data: Object.values(data.byStatus),
        backgroundColor: ['#c62828', '#ef9a9a', '#b0bec5']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

async function loadDashboard() {
  const data = await fetchDashboardData();
  renderBarChart(data);
  renderLineChart(data);
  renderPieChart(data);
}

loadDashboard();
