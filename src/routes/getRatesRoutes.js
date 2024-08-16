const express = require("express");
const router = express.Router();
const { getRates } = require("../controllers/getRatesController");

router.get("/getrates", getRates);

module.exports = router;
