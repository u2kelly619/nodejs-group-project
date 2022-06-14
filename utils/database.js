//匯入sequelize模組
const Sequelize = require('sequelize');

//new一個資料庫，(資料庫名稱, Username, Password)
//database是Sequelize class的實例(實體)
const database = new Sequelize('group-demo', 'kelly', '12345', {
    dialect: 'mysql',
    host: 'localhost'
});

//老師的遠端DB
// const database = new Sequelize ('demo', 'admin', 'admin', {
// 	dialect: 'mysql',
// 	host: '130.211.120.155'
// });

//匯出模組
module.exports = database;