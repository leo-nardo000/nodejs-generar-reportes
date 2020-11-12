const mysql = require("../database");
const bcryptjs = require("bcryptjs");

modificarUsuarioController = {}

modificarUsuarioController.inicioSelectPersonas = async function (req, res) {
	const personas = await mysql.query(
		"SELECT * FROM personas ORDER BY primer_nombre ASC "
	);

	res.status(200).json(personas);
};

modificarUsuarioController.inicioSelectHuellas = async function (req, res) {
	const huellas = await mysql.query(
		"SELECT * FROM huellas WHERE id_persona = ?",
		[req.params.id]
	);

	res.status(200).json(huellas);
};

modificarUsuarioController.modificarPersona = async function (req, res) {
	const {
		primer_nombre,
		primer_apellido,
		identificacion,
		correo_primario,
		fecha_nac,
		activo,
		tipo_usuario,
		username,
		pass
	} = req.body;

	delete req.body.id_persona;

	if (
		primer_nombre == "" ||
		primer_apellido == "" ||
		identificacion == "" ||
		correo_primario == "" ||
		fecha_nac == "" ||
		activo == "" ||
		tipo_usuario == ""
	) {
		return res.status(400).json({ res: "Campos Incompletos" });
	}

	if (tipo_usuario == 1) {
		if (pass.length > 0) {
			return res
				.status(400)
				.json({ res: "Los usuarios NORMALES no pueden tener contraseña" });
		}
		if (username.length > 0) {
			return res
				.status(400)
				.json({ res: "Los usuarios NORMALES no pueden tener nombre de Usuario" });
		}
	}

	if (tipo_usuario == 3 || tipo_usuario == 2) {
		if (pass == "") {
			return res
				.status(400)
				.json({ res: "Los usuarios ADMIN y REPORTES deben tener contraseña" });
		}
		if (username == "") {
			return res
				.status(400)
				.json({ res: "Los usuarios ADMIN y REPORTES deben tener nombre de Usuario" });
		}
	}

	const personas = await mysql.query(
		"SELECT identificacion,correo_primario,username FROM personas WHERE id_persona <> ?",
		[req.params.id]
	);

	for (const persona of personas) {
		if (persona.identificacion == identificacion) {
			return res
				.status(400)
				.json({ res: "Ya existe esta Identificacion, porfavor ingrese otra" });
		}
		if (persona.correo_primario == correo_primario) {
			return res
				.status(400)
				.json({ res: "Ya existe este Correo Primario, porfavor ingrese otro" });
		}

		if (persona.username == username) {
			return res
				.status(400)
				.json({ res: "Ya existe este nombre de usuario, porfavor ingrese otro" });
		}
	}

	await mysql.query("UPDATE personas SET ? WHERE id_persona = ?", [
		req.body,
		req.params.id,
	]);

	return res
		.status(200)
		.json({ res: "Persona Actualizada satisfactoriamente" });
};

modificarUsuarioController.eliminarPersona = async function (req,res) {
	console.log(req.params.id);

	await mysql.query("DELETE FROM personas WHERE id_persona = ?",[req.params.id])

	return res
		.status(200)
		.json({ res: "Persona Eliminada satisfactoriamente" });
}

module.exports = modificarUsuarioController;