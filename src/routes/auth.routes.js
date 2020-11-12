const router = require("express").Router();

const {signin,verifyToken} = require('../controllers/authController')

router
	.post("/signin",signin)

module.exports = router;
