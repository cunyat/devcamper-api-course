const express = require("express");
const { protect } = require("../middlewares/auth");
const { register, login, getMe } = require("../controllers/auth");

const router = express.Router();

router
  .post("/register", register)
  .post("/login", login)
  .get("/me", protect, getMe);

module.exports = router;
