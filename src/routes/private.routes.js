const router = require("express").Router();

const {
	verifyToken,
	nivelesUsuario,
} = require("../controllers/authController");

// ? controlador componente inicio: modificar usuario
const {
	inicioSelectPersonas,
	inicioSelectHuellas,
	modificarPersona,
	eliminarPersona,
} = require("../controllers/modificarUsuarioController");

// ? controlador componente signup: registrar usuario
const {
	signupSelectEmpresa,
	signupSelectCargo,
	registrarUsuario,
} = require("../controllers/registrarUsuarioController");

// ? controlador componente registrar empresa
const {
	registarEmpresa,
} = require("../controllers/registrarEmpresaController");

// ? controlador componente modificar empresa
const {
	eliminarCargo,
	agregarCargo,
	modificarCargo,
	obtenerHorarios,
	modificarEmpresa,
	modificarHorarios,
	eliminarEmpresa,
} = require("../controllers/modificarEmpresaController");

// ? controlador para generar reportes
const {
	generarReporteEmpresaPdf,
	generarReporteEmpleadoPdf,
	eliminarReportePdf,
	descargarReportePdf
} = require("../controllers/reportesController");

const { index } = require("../controllers/privateController");

router
	// ? ruta validar jwt
	.get("/", verifyToken, nivelesUsuario, index)
	// ? rutas componente inicio: modificar usuario
	.get("/inicioSelectPersonas", verifyToken, inicioSelectPersonas)
	.get("/inicioSelectHuellas/:id", verifyToken, inicioSelectHuellas)
	.put("/modificarPersona/:id", modificarPersona)
	.delete("/eliminarPersona/:id", eliminarPersona)
	// ? rutas componente signup: registrar usuario
	.get("/signupSelectEmpresa", verifyToken, signupSelectEmpresa)
	.get("/signupSelectCargo/:id", verifyToken, signupSelectCargo)
	.post("/registrarUsuario", verifyToken, registrarUsuario)
	// ? rutas componente registrar empresa
	.post("/registrar_empresa", verifyToken, registarEmpresa)
	// ? rutas componenente modificar empresa
	.delete("/eliminarCargo/:id", verifyToken, eliminarCargo)
	.post("/agregarCargo/:id", verifyToken, agregarCargo)
	.put("/modificarCargo/:id", verifyToken, modificarCargo)
	.get("/obtenerHorarios/:id", verifyToken, obtenerHorarios)
	.put("/modificarEmpresa/:id", verifyToken, modificarEmpresa)
	.delete("/eliminarEmpresa/:id", verifyToken, eliminarEmpresa)
	.put("/modificarHorarios/:id", verifyToken, modificarHorarios)
	// ? componenete generar reportes pdf
	.post("/generar-reporte-empresa/pdf", generarReporteEmpresaPdf)
	.post("/generar-reporte-empleado/pdf", generarReporteEmpleadoPdf)
	.delete("/eliminar-reporte/pdf/:nombre", eliminarReportePdf)
	.get("/descargar/:nombre", descargarReportePdf);

module.exports = router;
