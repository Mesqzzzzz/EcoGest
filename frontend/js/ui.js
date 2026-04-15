export function createActivityCard(activity) {
  const card = document.createElement("div");
  card.classList.add("card");

  card.innerHTML = `
    <h3>${activity.name}</h3>
    <p>${activity.date}</p>
    <button class="btn-join" data-id="${activity.id}">
      Participar
    </button>
  `;

  return card;
}

export function renderActivities(container, activities) {
  container.innerHTML = "";

  activities.forEach(act => {
    const card = createActivityCard(act);
    container.appendChild(card);
  });
}