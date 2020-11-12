const mysql = require("mysql");
const { promisify } = require("util");

const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

pool.getConnection(function (err, connection) {
	if (err) {
		if (err.code === "PROTOCOL_CONNECION_LOST") {
			console.error("DATABASE CONNECTION WAS CLOSED");
		}
		if (err.code === "ER_CON_COUNT_ERROR") {
			console.error("DATASE HAS TO MANY CONNECTIONS");
		}
		if (err.code === "ECONNREFUSED") {
			console.error("DATASE CONNENTION WAS REFUSED");
		}
	}

	if (connection) {
		connection.release();
		console.log("DB is Connected");
		return;
	}
});

pool.query = promisify(pool.query);

module.exports = pool;
