const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function loadActivity() {
  const res = await fetch(`http://localhost:3000/api/activities/${id}`);
  const act = await res.json();

  document.getElementById("title").innerText = act.name;
  document.getElementById("date").innerText = act.date;
  document.getElementById("description").innerText = act.description || "Sem descrição";
}

window.joinActivity = async function() {
  const name = prompt("Nome:");
  const email = prompt("Email:");

  await fetch(`http://localhost:3000/api/activities/${id}/participations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, email })
  });

  alert("Inscrição realizada com sucesso!");
};

loadActivity();