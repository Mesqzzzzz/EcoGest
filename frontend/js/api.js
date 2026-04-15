const API_URL = "http://localhost:3000/api";

export async function getActivities() {
  const res = await fetch(`${API_URL}/activities`);
  return res.json();
}

export async function participate(activityId, data) {
  return fetch(`${API_URL}/activities/${activityId}/participations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}