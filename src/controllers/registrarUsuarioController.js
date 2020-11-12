const mysql = require("../database");

registrarUsuarioController = {};

registrarUsuarioController.signupSelectEmpresa = async function (req, res) {
	const empresas = await mysql.query("SELECT * FROM empresas");

	res.status(200).json(empresas);
};

registrarUsuarioController.signupSelectCargo = async function (req, res) {
	const cargos = await mysql.query(
		"SELECT * FROM cargos WHERE id_empresa = ?",
		[req.params.id]
	);

	res.status(200).json(cargos);
};

registrarUsuarioController.registrarUsuario = async function (req, res) {
	const {
		tipo_usuario,
		primer_nombre,
		primer_apellido,
		correo_primario,
		identificacion,
		fecha_nac,
		pass,
		username,
		id_cargo,
		id_empresa
	} = req.body;

	delete req.body.confirmar_pass;

	if (
		tipo_usuario == "" ||
		primer_nombre == "" ||
		primer_apellido == "" ||
		correo_primario == "" ||
		identificacion == "" ||
		fecha_nac == "" ||
		id_cargo == "" ||
		id_empresa == "" 
	) {
		return res.status(400).json({ res: "Campos incompletos" });
	} else {
		const rows = await mysql.query(
			"SELECT identificacion,correo_primario FROM personas WHERE identificacion = ? OR correo_primario = ?",
			[identificacion, correo_primario]
		);

		for (const row of rows) {
			if (row.identificacion == identificacion) {
				return res.status(400).json({
					res:
						"Ya existe esa Identificacion, porfavor ingrese datos validos",
				});
			}
			if (row.correo_primario == correo_primario) {
				return res.status(400).json({
					res:
						"Ya existe ese Correo Primario, porfavor ingrese datos validos",
				});
			}
		}

	}
	if (tipo_usuario == "2" || tipo_usuario == "3") {
		if (pass == "") {
			return res.status(400).json({
				res: "Los tipos de usuarios ADMIN y REPORTES deben tener contraseña",
			});
		}

		if (username == "") {
			return res.status(400).json({
				res: "Los tipos de usuarios ADMIN y REPORTES deben tener Usuario",
			});
		}

		const rows = await mysql.query(
			"SELECT username FROM personas WHERE username = ?",
			[username]
		);

		if (rows.length > 0) {
			return res.status(400).json({
				res: "El nombre de usuario ya esta registrado, porfavor ingrese otro",
			});
		}
	}
	if (username == "") {
		delete req.body.username;
	}

	await mysql.query("INSERT INTO personas SET ?", [req.body]);

	res.status(200).json({ res: "Persona Registrada Satisfactoriamente" });
};

module.exports = registrarUsuarioController;