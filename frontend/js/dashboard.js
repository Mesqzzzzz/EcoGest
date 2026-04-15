async function loadDashboard() {
  const res = await fetch("http://localhost:3000/api/admin/dashboard");
  const data = await res.json();

  document.getElementById("activitiesCount").innerText = data.activities.completed;
  document.getElementById("participantsCount").innerText = data.participants;
  document.getElementById("photosCount").innerText = data.photos;

  renderChart(data);
}

function renderChart(data) {
  const ctx = document.getElementById("chart");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Planeadas", "Ativas", "Concluídas"],
      datasets: [{
        label: "Atividades",
        data: [
          data.activities.planned,
          data.activities.active,
          data.activities.completed
        ]
      }]
    }
  });
}

loadDashboard();