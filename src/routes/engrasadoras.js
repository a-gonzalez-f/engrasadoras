// routes/engrasadoras.js

const express = require("express");
const router = express.Router();
const controller = require("../controllers/engrasadorasController");

router.get("/", controller.getTodas);

module.exports = router;
