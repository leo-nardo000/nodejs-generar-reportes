const mysql = require("../database");

modificarEmpresaController = {};

modificarEmpresaController.eliminarCargo = async function (req,res) {
	try {
		const personas = await mysql.query("SELECT id_persona FROM personas WHERE id_cargo = ?",[req.params.id])

		if (personas.length > 0) {
			return res.status(400).json({res: "Hay personas que tienen este cargo, el cargo no puede ser eliminado"})
		}
		await mysql.query("DELETE FROM horarios WHERE id_cargo = ?",[req.params.id])
		await mysql.query("DELETE FROM cargos WHERE id_cargo = ?",[req.params.id])
	} catch (error) {
		console.log(error);
	}


	res.status(200).json({res:"Cargo Eliminado Satisfactoriamente"})
}

modificarEmpresaController.agregarCargo = async function (req,res) {

	if (req.body.cargo == "") {
		return res.status(400).json({res:"El campo agregar cargo no puede estar vacio"})
	}

	const cargo = {
		descripcion:req.body.cargo,
		id_empresa: req.params.id
	}

	const cargo_existente = await mysql.query("SELECT id_cargo FROM cargos WHERE id_empresa = ? AND descripcion = ?",[cargo.id_empresa,cargo.descripcion]);


	if (cargo_existente.length > 0) {
		return res.status(400).json({res:"No puede agregar un cargo que ya existe en la empresa."})
	}

	const nuevo_cargo = await mysql.query("INSERT INTO cargos SET ?", [cargo]);

	const horarios = {
		primera_entrada:"08:00:00",
		primera_salida:"12:00:00",
		segunda_entrada:"13:00:00",
		segunda_salida:"17:00:00",
		id_empresa: req.params.id,
		id_cargo: nuevo_cargo.insertId
	}

	await mysql.query("INSERT INTO horarios SET ?",[horarios]);

	res.status(200).json({res:"Cargo agregado Satisfactoriamente"})
}

modificarEmpresaController.modificarCargo = async function (req,res) {
	if (req.body.descripcion == "") {
		return res.status(400).json({res:"El campo modificar no puede estar vacio"})
	}

	const cargo_existente = await mysql.query("SELECT id_cargo FROM cargos WHERE id_empresa = ? AND descripcion = ?",[req.body.id_empresa,req.body.descripcion]);

	if (cargo_existente.length > 0) {
		return res.status(400).json({res:"Este cargo ya existe para esta empresa seleccionada"})
	}

	delete req.body.id_cargo;
	delete req.body.id_empresa;

	await mysql.query("UPDATE cargos SET ? WHERE id_cargo = ?",[req.body,req.params.id]);

	res.status(200).json({res:"Cargo modificado Satisfactoriamente"})
}

modificarEmpresaController.obtenerHorarios = async function (req,res) {
	
	const horario = await mysql.query("SELECT * FROM horarios WHERE id_cargo = ?",[req.params.id]);

	res.status(200).json(horario[0])
}

modificarEmpresaController.modificarEmpresa = async function (req,res) {

	const {razon_social,rif,telefono,direccion,id_cargo} = req.body;

	if (razon_social == "" || rif == "" || telefono == "" || direccion == "") {
		res.status(400).json({res:'Campos Incompletos'})
	}

	const empresa = {
		razon_social,
		rif,
		telefono,
		direccion
	}

	await mysql.query('UPDATE empresas SET ? WHERE id_empresa = ? ',[empresa,req.params.id]);

	res.status(200).json({res:"Empresa Modificada satisfactoriamente"})
}

modificarEmpresaController.eliminarEmpresa = async function (req,res) {
	console.log(req.params.id);

	await mysql.query("DELETE FROM empresas WHERE id_empresa = ?",[req.params.id]);

	res.status(200).json({res:"Empresa Eliminada satisfactoriamente"})
}

modificarEmpresaController.modificarHorarios = async function (req,res) {

		const horarios = {
			primera_entrada:req.body.primera_entrada,
			primera_salida:req.body.primera_salida,
			segunda_entrada:req.body.segunda_entrada,
			segunda_salida:req.body.segunda_salida,
		}

		if (horarios.segunda_entrada == "" && horarios.segunda_salida == "") {
			horarios.segunda_entrada = "00:00:00";
			horarios.segunda_salida = "00:00:00";
		}

		const horario_existente = await mysql.query("SELECT id_horario FROM horarios WHERE id_cargo = ?",[req.params.id]);

		if (horario_existente.length > 0) {
			await mysql.query("UPDATE horarios SET ? WHERE id_cargo = ?",[horarios,req.params.id])
		} else {
			horarios.id_empresa = req.body.id_empresa;
			horarios.id_cargo = req.params.id;
			await mysql.query("INSERT INTO horarios SET ?",[horarios])
		}

		res.status(200).json({res:"Horarios Modificados Satisfactoriamente"})
}

module.exports = modificarEmpresaController;