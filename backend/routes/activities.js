const container = document.getElementById("activities-container");

async function loadActivities() {
  const res = await fetch("http://localhost:3000/api/activities");
  const data = await res.json();

  renderActivities(data.data);
}

function renderActivities(activities) {
  container.innerHTML = "";

  activities.forEach(act => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <h3>${act.name}</h3>
      <p>${act.date}</p>
      <button onclick="viewDetails(${act.id})">Ver Detalhes</button>
    `;

    container.appendChild(card);
  });
}

window.viewDetails = function(id) {
  window.location.href = `activity-detail.html?id=${id}`;
};

loadActivities();