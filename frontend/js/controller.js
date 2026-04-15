import { renderActivities } from "./ui.js";

const container = document.getElementById("activities-container");

async function loadActivities() {
  const res = await fetch("http://localhost:3000/api/activities");
  const activities = await res.json();

  renderActivities(container, activities.data);
}

// EVENTOS (em vez de onclick no HTML 👇)
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-join")) {
    const id = e.target.dataset.id;

    const email = prompt("Insere o teu email:");

    await fetch(`http://localhost:3000/api/activities/${id}/participations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    alert("Inscrição feita!");
  }
});

loadActivities();