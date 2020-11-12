const mysql = require("../database");

registrarEmpresaController = {};

registrarEmpresaController.registarEmpresa = async function (req, res) {
	const { razon_social, rif, direccion, telefono } = req.body;

	if (
		razon_social === "" ||
		rif === "" ||
		direccion === "" ||
		telefono === "" ||
		Object.keys(req.body).length < 1
	) {
		return res.status(400).json({ res: "Todos los campos son obligatorios" });
	}
	await mysql.query("INSERT INTO empresas SET ?", [req.body]);
	return res.status(200).json({ res: "Empresa Registrada" });
};

module.exports = registrarEmpresaController;