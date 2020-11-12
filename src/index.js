
if (process.env.NODE_ENV === 'development') {
    require('dotenv').config();
}

const express = require("express");
const morgan = require("morgan");
const cors = require('cors')
const path = require("path")


const app = express();

// ? settings
app.set("port", process.env.PORT || 4000);

// ? middlewares
app.use(cors())
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ? routes
app.use("/api", require("./routes/auth.routes.js"));
app.use("/api/inicio", require("./routes/private.routes.js"));

// ? static files 
app.use(express.static(path.join(__dirname,"public")))

// ? starting the server
app.listen(app.get("port"), () =>
	console.log("Server on port", app.get("port"))
);
