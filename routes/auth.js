//把跟權限相關的設定搬到auth.js，使專案架構更接近 MVC 設計模式

//引入express
const express = require('express');
//引入auth的controller模組
const authController = require('../controllers/auth');

//使用中介軟體express中的Router()
const router = express.Router();

//從app.get改成router.get
//引用authController模組物件中的getLogin函式
// router.get('/login', authController.getLogin);
// router.get('/signup', authController.getSignup)
router.get('/loginStatus', authController.loginStatus)

//處理post請求
router.post('/login', authController.postLogin);
router.post('/signup', authController.postSignup);
router.post('/logout', authController.postLogout);

//匯出模組
module.exports = router;
