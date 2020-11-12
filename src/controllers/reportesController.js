const mysql = require("../database");
const PDF = require("pdfmake");
const fs = require("fs-extra");
var path = require("path");

const fonts = {
	Roboto: {
		normal: Buffer.from(
			require("pdfmake/build/vfs_fonts").pdfMake.vfs["Roboto-Regular.ttf"],
			"base64"
		),
		bold: Buffer.from(
			require("pdfmake/build/vfs_fonts").pdfMake.vfs["Roboto-Medium.ttf"],
			"base64"
		),
	},
};

const styles = {
	header: {
		bold: true,
		fontSize: 8,
		alignment: "center",
		color: "#000000",
		decoration: "underline",
		margin: [0, 0, 0, 10],
	},
	fecha: {
		bold: true,
		fontSize: 8,
		alignment: "center",
		color: "#000000",
		decoration: "underline",
		margin: [0, 0, 0, 10],
	},
	empresa: {
		bold: true,
		fontSize: 8,
		alignment: "center",
		color: "#000000",
		decoration: "underline",
		margin: [0, 0, 0, 10],
	},
	tableHeader: {
		bold: true,
		fontSize: 6,
		color: "black",
		alignment: "center",
		margin: [0, 10, 0, 10.73],
	},
	tableBody: {
		fontSize: 5,
		color: "black",
		alignment: "center",
		bold: true,
		margin: [0, 5, 0, 5],
	},
};

const printer = new PDF(fonts);

reporteController = {};

reporteController.generarReporteEmpresaPdf = async function (req, res) {
	const { desde, hasta, turno, empresa } = req.body;

	const empleados = await mysql.query(
		"SELECT id_persona,tipo_usuario,id_empresa,id_cargo,primer_nombre,primer_apellido,identificacion FROM personas WHERE id_empresa = ?",
		[empresa]
	);

	const empresa_seleccionada = await mysql.query(
		"SELECT razon_social, rif FROM empresas WHERE id_empresa = ?",
		[empresa]
	);

	let chequeos;

	if (turno === "diurno") {
		chequeos = await mysql.query(
			"SELECT id_chequeo,fecha,id_persona,id_empresa,primera_entrada,primera_salida,segunda_entrada,segunda_salida FROM chequeos WHERE id_empresa = ? AND fecha BETWEEN ? AND ? AND primera_entrada BETWEEN ? AND ? ORDER BY fecha ASC",
			[empresa, desde, hasta, "06:00:00", "08:00:00"]
		);
	} else if (turno === "mixto") {
		chequeos = await mysql.query(
			"SELECT id_chequeo,fecha,id_persona,id_empresa,primera_entrada,primera_salida,segunda_entrada,segunda_salida FROM chequeos WHERE id_empresa = ? AND fecha BETWEEN ? AND ? AND primera_entrada BETWEEN ? AND ? ORDER BY fecha ASC",
			[empresa, desde, hasta, "14:00:00", "15:00:00"]
		);
	} else if (turno === "nocturno") {
		chequeos = await mysql.query(
			"SELECT id_chequeo,fecha,id_persona,id_empresa,primera_entrada,primera_salida,segunda_entrada,segunda_salida FROM chequeos WHERE id_empresa = ? AND fecha BETWEEN ? AND ? AND primera_entrada BETWEEN ? AND ? ORDER BY fecha ASC",
			[empresa, desde, hasta, "18:00:00", "19:00:00"]
		);
	} else {
		chequeos = await mysql.query(
			"SELECT id_chequeo,fecha,id_persona,id_empresa,primera_entrada,primera_salida,segunda_entrada,segunda_salida FROM chequeos WHERE id_empresa = ? AND fecha BETWEEN ? AND ? ORDER BY fecha ASC",
			[empresa, desde, hasta]
		);
	}

	const horarios = await mysql.query(
		"SELECT * FROM horarios WHERE id_empresa = ?",
		[empresa]
	);

	const personas_seleccionadas = [];

	for (const chequeo_persona of chequeos) {
		const empleadoChequeado = await empleados.filter(
			(empleado) => empleado.id_persona == chequeo_persona.id_persona
		)[0];

		chequeo_persona.id_persona = empleadoChequeado.id_persona;
		chequeo_persona.tipo_usuario = empleadoChequeado.tipo_usuario;
		chequeo_persona.id_empresa = empleadoChequeado.id_empresa;
		chequeo_persona.id_cargo = empleadoChequeado.id_cargo;
		chequeo_persona.primer_nombre = empleadoChequeado.primer_nombre;
		chequeo_persona.primer_apellido = empleadoChequeado.primer_apellido;
		chequeo_persona.identificacion = empleadoChequeado.identificacion;

		const mes = chequeo_persona.fecha.getMonth() + 1;
		const dia = chequeo_persona.fecha.getDate();
		const anio = chequeo_persona.fecha.getFullYear();

		chequeo_persona.fecha_chequeo = `${dia}-${mes}-${anio}`;

		chequeo_persona.primera_entrada_chequeo_horas = parseInt(
			chequeo_persona.primera_entrada.split(":")[0]
		);
		chequeo_persona.primera_entrada_chequeo_minutos = parseInt(
			chequeo_persona.primera_entrada.split(":")[1]
		);

		chequeo_persona.primera_salida_chequeo_horas = parseInt(
			chequeo_persona.primera_salida.split(":")[0]
		);
		chequeo_persona.primera_salida_chequeo_minutos = parseInt(
			chequeo_persona.primera_salida.split(":")[1]
		);

		chequeo_persona.segunda_entrada_chequeo_horas = parseInt(
			chequeo_persona.segunda_entrada.split(":")[0]
		);
		chequeo_persona.segunda_entrada_chequeo_minutos = parseInt(
			chequeo_persona.segunda_entrada.split(":")[1]
		);

		chequeo_persona.segunda_salida_chequeo_horas = parseInt(
			chequeo_persona.segunda_salida.split(":")[0]
		);
		chequeo_persona.segunda_salida_chequeo_minutos = parseInt(
			chequeo_persona.segunda_salida.split(":")[1]
		);

		personas_seleccionadas.push(chequeo_persona);
	}

	for (const persona of personas_seleccionadas) {
		const horariosSeleccionados = horarios.filter(
			(horario) => horario.id_cargo == persona.id_cargo
		)[0];

		persona.primera_entrada_horario_horas = parseInt(
			horariosSeleccionados.primera_entrada.split(":")[0]
		);
		persona.primera_entrada_horario_minutos = parseInt(
			horariosSeleccionados.primera_entrada.split(":")[1]
		);
		persona.primera_salida_horario_horas = parseInt(
			horariosSeleccionados.primera_salida.split(":")[0]
		);
		persona.primera_salida_horario_minutos = parseInt(
			horariosSeleccionados.primera_salida.split(":")[1]
		);
		persona.segunda_entrada_horario_horas = parseInt(
			horariosSeleccionados.segunda_entrada.split(":")[0]
		);
		persona.segunda_entrada_horario_minutos = parseInt(
			horariosSeleccionados.segunda_entrada.split(":")[1]
		);
		persona.segunda_salida_horario_horas = parseInt(
			horariosSeleccionados.segunda_salida.split(":")[0]
		);
		persona.segunda_salida_horario_minutos = parseInt(
			horariosSeleccionados.segunda_salida.split(":")[1]
		);
	}

	const PDFcontent = [];

	const d = fechaInvertida(desde);
	const h = fechaInvertida(hasta);

	PDFcontent.push({
		text: "Reporte de Asistencia de los Empleados",
		style: "header",
	});
	PDFcontent.push({
		text: `Fecha: De ${d.dia}-${d.mes}-${d.anio} a ${h.dia}-${h.mes}-${h.anio}`,
		style: "fecha",
	});
	PDFcontent.push({
		text: `Empresa ${empresa_seleccionada[0].razon_social}. ${empresa_seleccionada[0].rif}. `,
		style: "empresa",
	});

	const informacion_usuario = [];

	for (let i = 0; i < personas_seleccionadas.length; i++) {
		// * adelanto retraso primera entrada
		const p_entrada = calcularHorasMinutos(
			personas_seleccionadas[i].primera_entrada_horario_horas,
			personas_seleccionadas[i].primera_entrada_chequeo_horas,
			personas_seleccionadas[i].primera_entrada_horario_minutos,
			personas_seleccionadas[i].primera_entrada_chequeo_minutos
		);
		// * adelanto retraso primera salida
		const p_salida = calcularHorasMinutos(
			personas_seleccionadas[i].primera_salida_horario_horas,
			personas_seleccionadas[i].primera_salida_chequeo_horas,
			personas_seleccionadas[i].primera_salida_horario_minutos,
			personas_seleccionadas[i].primera_salida_chequeo_minutos
		);
		// * adelanto retraso segunda entrada
		const s_entrada = calcularHorasMinutos(
			personas_seleccionadas[i].segunda_entrada_horario_horas,
			personas_seleccionadas[i].segunda_entrada_chequeo_horas,
			personas_seleccionadas[i].segunda_entrada_horario_minutos,
			personas_seleccionadas[i].segunda_entrada_chequeo_minutos
		);
		// * adelanto retraso segunda salida
		const s_salida = calcularHorasMinutos(
			personas_seleccionadas[i].segunda_salida_horario_horas,
			personas_seleccionadas[i].segunda_salida_chequeo_horas,
			personas_seleccionadas[i].segunda_salida_horario_minutos,
			personas_seleccionadas[i].segunda_salida_chequeo_minutos
		);

		const info = [
			{ text: `${i + 1}`, style: "tableBody" },
			{
				text: `${personas_seleccionadas[i].primer_nombre} ${personas_seleccionadas[i].primer_apellido}`,
				style: "tableBody",
			},
			{
				text: `${personas_seleccionadas[i].identificacion}`,
				style: "tableBody",
			},
			{
				text: `${personas_seleccionadas[i].fecha_chequeo}`,
				style: "tableBody",
			},
			// * primera entrada
			{
				text: `${
					personas_seleccionadas[i].primera_entrada == "00:00:00"
						? "N/A"
						: personas_seleccionadas[i].primera_entrada
				}`,
				style: "tableBody",
			},
			{
				text: `Horas ${p_entrada.horas} / Mins ${p_entrada.minutos} ${p_entrada.adelanto_retraso}`,
				style: "tableBody",
			},
			// * primera salida
			{
				text: `${
					personas_seleccionadas[i].primera_salida == "00:00:00"
						? "N/A"
						: personas_seleccionadas[i].primera_salida
				}`,
				style: "tableBody",
			},
			{
				text: `${p_salida.horas} Hora(s) / ${p_salida.minutos} Min(s) ${p_salida.adelanto_retraso}`,
				style: "tableBody",
			},
			// * segunda entrada
			{
				text: `${
					personas_seleccionadas[i].segunda_entrada == "00:00:00"
						? "N/A"
						: personas_seleccionadas[i].segunda_entrada
				}`,
				style: "tableBody",
			},
			{
				text: `Horas ${s_entrada.horas} / Mins ${s_entrada.minutos} ${s_entrada.adelanto_retraso}`,
				style: "tableBody",
			},
			// * segunda salida
			{
				text: `${
					personas_seleccionadas[i].segunda_salida == "00:00:00"
						? "N/A"
						: personas_seleccionadas[i].segunda_salida
				}`,
				style: "tableBody",
			},
			{
				text: `Horas ${s_salida.horas} / Mins ${s_salida.minutos} ${s_salida.adelanto_retraso}`,
				style: "tableBody",
			},
		];

		informacion_usuario.push(info);
	}

	let table = {
		body: [
			[
				{ text: "N°.", style: "tableHeader" },
				{ text: "EMPLEADO", style: "tableHeader" },
				{ text: "IDENTIFICACIÓN", style: "tableHeader" },
				{ text: "FECHA", style: "tableHeader" },
				{ text: "PRIMERA ENTRADA", style: "tableHeader" },
				{ text: "RETRASO/ADELANTO", style: "tableHeader" },
				{ text: "PRIMERA SALIDA", style: "tableHeader" },
				{ text: "RETRASO/ADELANTO", style: "tableHeader" },
				{ text: "SEGUNDA ENTRADA", style: "tableHeader" },
				{ text: "RETRASO/ADELANTO", style: "tableHeader" },
				{ text: "SEGUNDA SALIDA", style: "tableHeader" },
				{ text: "RETRASO/ADELANTO", style: "tableHeader" },
			],
		],
	};

	for (const info of informacion_usuario) {
		table.body.push(info);
	}

	PDFcontent.push({
		table,
	});

	let docDefinition = {
		content: PDFcontent,
		styles,
	};

	let pdfDoc = printer.createPdfKitDocument(docDefinition);
	pdfDoc.pipe(
		fs.createWriteStream(`src/public/pdf/${empresa_seleccionada[0].razon_social}_de_${d.dia}-${d.mes}-${d.anio}_a_${h.dia}-${h.mes}-${h.anio}.pdf`
		)
	);
    pdfDoc.end();

	res.status(200).json({ res: "pdf creado",nombre:`${empresa_seleccionada[0].razon_social}_de_${d.dia}-${d.mes}-${d.anio}_a_${h.dia}-${h.mes}-${h.anio}.pdf`});

};

reporteController.generarReporteEmpleadoPdf = async function (req, res) {
	const { empleado, empleado_desde, empleado_hasta } = req.body;

	const persona = await mysql.query(
		"SELECT id_persona,tipo_usuario,id_cargo,primer_nombre,primer_apellido,identificacion,razon_social,rif FROM personas INNER JOIN empresas ON personas.id_empresa = empresas.id_empresa WHERE id_persona = ?",
		[empleado]
	);

	const chequeos = await mysql.query(
		"SELECT id_chequeo,fecha,id_persona,id_empresa,primera_entrada,primera_salida,segunda_entrada,segunda_salida FROM chequeos WHERE id_persona = ? AND fecha BETWEEN ? AND ? ORDER BY fecha ASC",
		[empleado, empleado_desde, empleado_hasta]
	);

	const horarios = await mysql.query(
		"SELECT * FROM horarios WHERE id_cargo = ?",
		[persona[0].id_cargo]
	);

	for (const chequeo of chequeos) {
		const mes = chequeo.fecha.getMonth() + 1;
		const dia = chequeo.fecha.getDate();
		const anio = chequeo.fecha.getFullYear();

		chequeo.fecha_chequeo = `${dia}-${mes}-${anio}`;
		chequeo.primera_entrada_horario_horas = parseInt(
			horarios[0].primera_entrada.split(":")[0]
		);
		chequeo.primera_entrada_horario_minutos = parseInt(
			horarios[0].primera_entrada.split(":")[1]
		);
		chequeo.primera_salida_horario_horas = parseInt(
			horarios[0].primera_salida.split(":")[0]
		);
		chequeo.primera_salida_horario_minutos = parseInt(
			horarios[0].primera_salida.split(":")[1]
		);
		chequeo.segunda_entrada_horario_horas = parseInt(
			horarios[0].segunda_entrada.split(":")[0]
		);
		chequeo.segunda_entrada_horario_minutos = parseInt(
			horarios[0].segunda_entrada.split(":")[1]
		);
		chequeo.segunda_salida_horario_horas = parseInt(
			horarios[0].segunda_salida.split(":")[0]
		);
		chequeo.segunda_salida_horario_minutos = parseInt(
			horarios[0].segunda_salida.split(":")[1]
		);

		chequeo.primera_entrada_chequeo_horas = parseInt(
			chequeo.primera_entrada.split(":")[0]
		);
		chequeo.primera_entrada_chequeo_minutos = parseInt(
			chequeo.primera_entrada.split(":")[1]
		);
		chequeo.primera_salida_chequeo_horas = parseInt(
			chequeo.primera_salida.split(":")[0]
		);
		chequeo.primera_salida_chequeo_minutos = parseInt(
			chequeo.primera_salida.split(":")[1]
		);
		chequeo.segunda_entrada_chequeo_horas = parseInt(
			chequeo.segunda_entrada.split(":")[0]
		);
		chequeo.segunda_entrada_chequeo_minutos = parseInt(
			chequeo.segunda_entrada.split(":")[1]
		);
		chequeo.segunda_salida_chequeo_horas = parseInt(
			chequeo.segunda_salida.split(":")[0]
		);
		chequeo.segunda_salida_chequeo_minutos = parseInt(
			chequeo.segunda_salida.split(":")[1]
		);
	}

	const PDFcontent = [];

	const d = fechaInvertida(empleado_desde);
	const h = fechaInvertida(empleado_hasta);

	PDFcontent.push({
		text: `Reporte de Asistencia del Empleado ${persona[0].primer_nombre} ${persona[0].primer_apellido}`,
		style: "header",
	});
	PDFcontent.push({
		text: `Fecha: De ${d.dia}-${d.mes}-${d.anio} a ${h.dia}-${h.mes}-${h.anio}`,
		style: "fecha",
	});
	PDFcontent.push({
		text: `Empresa ${persona[0].razon_social}. ${persona[0].rif}.`,
		style: "empresa",
	});

	const informacion_usuario = [];

	for (let i = 0; i < chequeos.length; i++) {
		// * adelanto retraso primera entrada
		const p_entrada = calcularHorasMinutos(
			chequeos[i].primera_entrada_horario_horas,
			chequeos[i].primera_entrada_chequeo_horas,
			chequeos[i].primera_entrada_horario_minutos,
			chequeos[i].primera_entrada_chequeo_minutos
		);
		// * adelanto retraso primera salida
		const p_salida = calcularHorasMinutos(
			chequeos[i].primera_salida_horario_horas,
			chequeos[i].primera_salida_chequeo_horas,
			chequeos[i].primera_salida_horario_minutos,
			chequeos[i].primera_salida_chequeo_minutos
		);
		// * adelanto retraso segunda entrada
		const s_entrada = calcularHorasMinutos(
			chequeos[i].segunda_entrada_horario_horas,
			chequeos[i].segunda_entrada_chequeo_horas,
			chequeos[i].segunda_entrada_horario_minutos,
			chequeos[i].segunda_entrada_chequeo_minutos
		);
		// * adelanto retraso segunda salida
		const s_salida = calcularHorasMinutos(
			chequeos[i].segunda_salida_horario_horas,
			chequeos[i].segunda_salida_chequeo_horas,
			chequeos[i].segunda_salida_horario_minutos,
			chequeos[i].segunda_salida_chequeo_minutos
		);

		const info = [
			{ text: `${i + 1}`, style: "tableBody" },
			{ text: `${chequeos[i].fecha_chequeo}`, style: "tableBody" },
			// * primera entrada
			{
				text: `${
					chequeos[i].primera_entrada == "00:00:00"
						? "N/A"
						: chequeos[i].primera_entrada
				}`,
				style: "tableBody",
			},
			{
				text: `Horas ${p_entrada.horas} / Mins ${p_entrada.minutos} ${p_entrada.adelanto_retraso}`,
				style: "tableBody",
			},
			// * primera salida
			{
				text: `${
					chequeos[i].primera_salida == "00:00:00"
						? "N/A"
						: chequeos[i].primera_salida
				}`,
				style: "tableBody",
			},
			{
				text: `${p_salida.horas} Hora(s) / ${p_salida.minutos} Min(s) ${p_salida.adelanto_retraso}`,
				style: "tableBody",
			},
			// * segunda entrada
			{
				text: `${
					chequeos[i].segunda_entrada == "00:00:00"
						? "N/A"
						: chequeos[i].segunda_entrada
				}`,
				style: "tableBody",
			},
			{
				text: `Horas ${s_entrada.horas} / Mins ${s_entrada.minutos} ${s_entrada.adelanto_retraso}`,
				style: "tableBody",
			},
			// * segunda salida
			{
				text: `${
					chequeos[i].segunda_salida == "00:00:00"
						? "N/A"
						: chequeos[i].segunda_salida
				}`,
				style: "tableBody",
			},
			{
				text: `Horas ${s_salida.horas} / Mins ${s_salida.minutos} ${s_salida.adelanto_retraso}`,
				style: "tableBody",
			},
		];

		informacion_usuario.push(info);
	}

	let table = {
		body: [
			[
				{ text: "N°.", style: "tableHeader" },
				{ text: "FECHA", style: "tableHeader" },
				{ text: "PRIMERA ENTRADA", style: "tableHeader" },
				{ text: "RETRASO/ADELANTO", style: "tableHeader" },
				{ text: "PRIMERA SALIDA", style: "tableHeader" },
				{ text: "RETRASO/ADELANTO", style: "tableHeader" },
				{ text: "SEGUNDA ENTRADA", style: "tableHeader" },
				{ text: "RETRASO/ADELANTO", style: "tableHeader" },
				{ text: "SEGUNDA SALIDA", style: "tableHeader" },
				{ text: "RETRASO/ADELANTO", style: "tableHeader" },
			],
		],
	};

	for (const info of informacion_usuario) {
		table.body.push(info);
	}

	PDFcontent.push({
		table,
	});

	let docDefinition = {
		content: PDFcontent,
		styles,
	};

	let pdfDoc = printer.createPdfKitDocument(docDefinition);
	pdfDoc.pipe(
		fs.createWriteStream(`src/public/pdf/${persona[0].razon_social}-${persona[0].primer_nombre} ${persona[0].primer_apellido} de ${d.dia}-${d.mes}-${d.anio} a ${h.dia}-${h.mes}-${h.anio}.pdf`
		)
	);
	pdfDoc.end();

	res.status(200).json({ res: "PDF creado",nombre: `${persona[0].razon_social}-${persona[0].primer_nombre} ${persona[0].primer_apellido} de ${d.dia}-${d.mes}-${d.anio} a ${h.dia}-${h.mes}-${h.anio}.pdf`});
};

reporteController.eliminarReportePdf = function (req,res) {
	fs.unlink(path.resolve('./src/public/pdf/'+req.params.nombre));
	res.json({res: "pdf eliminado"})
}

reporteController.descargarReportePdf = function (req,res) {
	res.download(__dirname+"/../public/pdf/"+req.params.nombre,req.params.id,function (err) {
		if (err) {
			console.log(err);
		} else {
			console.log('listo');
		}
	})
}

function calcularHorasMinutos(p_hora, s_hora, p_min, s_min) {
	let adelanto_retraso = "";

	if (s_hora == 0 && s_min == 0) {
		return {
			horas: 0,
			minutos: 0,
			adelanto_retraso,
		};
	}

	let horas = p_hora - s_hora;

	let minutos = p_min - s_min;

	if (horas < 0) {
		adelanto_retraso = "(R)";
	} else if (horas > 0) {
		if (minutos < 0) {
			horas--;
			minutos = 60 + minutos;
		}
		adelanto_retraso = "(A)";
	} else {
		adelanto_retraso = "";

		if (minutos < 0) {
			adelanto_retraso = "(R)";
		}
		if (minutos > 0) {
			adelanto_retraso = "(A)";
		}
	}

	return {
		horas: Math.abs(horas),
		minutos: Math.abs(minutos),
		adelanto_retraso,
	};
}

function fechaInvertida(fecha) {
	const fecha_ = fecha.split("-");

	return {
		dia: fecha_[2],
		mes: fecha_[1],
		anio: fecha_[0],
	};
}

module.exports = reporteController;
