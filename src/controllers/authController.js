const jwt = require("jsonwebtoken");
const mysql = require("../database");
auth = {};

// * funcion de autenticacion por usuario o por correo en el mismo campo
auth.signin = async function (req, res) {
	const { username, password } = req.body;
	const rows = await mysql.query("SELECT * FROM personas WHERE username = ?", [
		username,
	]);
	let user;

	if (rows.length > 0) {
		user = rows[0];
		if (user.pass !== password) {
			return res.status(400).json("Contraseña Incorrecta" );
		}
		const token = jwt.sign({ id: user.id_persona }, process.env.SECRET_KEY);
		return res.status(200).json(token);
	} else {
		const rows = await mysql.query(
			"SELECT * FROM personas WHERE correo_primario = ?",
			[username]
		);
		if (rows.length > 0) {
			user = rows[0];
			if (user.pass !== password) {
				return res.status(400).json("Contraseña Incorrecta");
			}
			const token = jwt.sign({ id: user.id_persona }, process.env.SECRET_KEY);
			return res.status(200).json(token);
		} else {
			return res.status(400).json("Usuario o correo invalido");
		}
	}
};

auth.nivelesUsuario = async function (req,res) {
	const rol = await mysql.query("SELECT tipo_usuario FROM personas WHERE id_persona = ?",[req.userId]);

	res.json(rol[0])
}

auth.verifyToken = function (req, res, next) {
	if (!req.headers.authorizations) {
		return res.status(401).json("No existe la cabecera");
	}

	const token = req.headers.authorizations.split(" ")[1];

	if (token === null) {
		return res.status(401).json("Authorization denied");
	}
	
	try {
		const payload = jwt.verify(token, process.env.SECRET_KEY);
		req.userId = payload.id;
	} catch (error) {
		console.log(error);
		return res.status(400).json("No existe el token");
	}
	next();
};

module.exports = auth;
