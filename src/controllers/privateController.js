const mysql = require("../database");

privateController = {};

privateController.index = function (req, res) {
	res.status(200).json({ res: "exito" });
};



module.exports = privateController;
