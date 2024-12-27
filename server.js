const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000;

require("dotenv").config();
//config json response
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173", "https://get-a-pet-frontend-six.vercel.app"]
  })
);

//public folder

app.use(express.static("public"));

//routes
const UserRoutes = require("./routes/userRoutes.js");
const PetRoutes =  require("./routes/PetRoutes.js");
const AdminRoutes = require('./routes/adminRoutes.js')
app.use("/users", UserRoutes);
app.use('/pets', PetRoutes)
app.use('/admin', AdminRoutes);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
