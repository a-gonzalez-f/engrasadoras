// routes/engrasadoras.js

const express = require("express");
const router = express.Router();
const {
  getTodas,
  actualizarSeteo,
} = require("../controllers/engrasadorasController");

router.get("/", getTodas);
router.put("/:id", actualizarSeteo);

module.exports = router;
