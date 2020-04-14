const express = require("express");
const app = express();
const connectDB = require("./config/db");
const path = require("path");
connectDB(); //connecting with mongodb database

app.use(express.json({ extended: false })); //middleware for post req

app.use("/api/users", require("./routes/users")); //using routes for different endpoints
app.use("/api/auth", require("./routes/auth"));
app.use("/api/contacts", require("./routes/contacts"));

//serve static assests in production
if (process.env.NODE_ENV === "production") {
	app.use(express.static("client/build"));
	app.get("*", (req, res) =>
		res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
	);
}

const port = process.env.PORT || 5000; //pick port if it is there in env variable else 5000

app.listen(port);
