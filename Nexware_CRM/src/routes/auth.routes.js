const express = require('express');
const router = express.Router();

const authCtrl = require('../controllers/auth.controller');
const developerOnly = require('../middleware/developerOnly');
const { loginLimiter } = require("../middleware/rateLimiter");
const auth = require('../middleware/authMiddleware');

router.post("/login", loginLimiter, authCtrl.login);
router.post("/register-secret", authCtrl.register);

router.get("/lastlogin", auth, authCtrl.getMyLastLogin);

module.exports = router;
