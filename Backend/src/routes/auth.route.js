const express = require('express');
const userModel = require('../models/user.model');
const authController = require('../controllers/auth.controller');
const cookieParser = require("cookie-parser")


const router = express.Router();





router.post('/register',authController.userRegisterController)
router.post('/login',authController.userLoginController)


module.exports=router;