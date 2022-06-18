//把跟權限相關的設定搬到auth.js，使專案架構更接近 MVC 設計模式

//引入express
const express = require('express');
//引入shop的controller模組
const shopController = require('../controllers/shop');
//使用中介軟體express中的Router()
const router = express.Router();
//引入路由守衛isLogin
const isLogin = require('../authGuard/isLogin');

//get寫在use之後，因get會進到別的頁面(?)，不會再進中介軟體
//預設發起請求後會自動結束，所以不需要next參數
//處理路由/的get請求
router.get('/products', shopController.getIndex);

//登入狀態下才會執行這些controllers
router.get('/cart', shopController.getCart); //拿掉isLogin
router.post('/cart-add-item', shopController.postCartAddItem);
router.post('/cart-delete-item', shopController.postCartDeleteItem);
router.post('/add-order', shopController.addOrder);

//匯出模組
module.exports = router;

