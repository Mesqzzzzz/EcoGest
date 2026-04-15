const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const activitiesRoutes = require("./routes/activities");

app.use("/api/activities", activitiesRoutes);

app.listen(3000, () => {
  console.log("Servidor a correr 🚀");
});