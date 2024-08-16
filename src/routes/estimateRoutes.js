const express = require("express");
const router = express.Router();
const { estimate } = require("../controllers/estimateController");

router.get("/estimate", estimate);

module.exports = router;
