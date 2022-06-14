// console.log("hello world");

//------第一個區塊，內建模組------
const path = require('path');
// const http = require('http');

//------第二個區塊，第三方模組(套件)------
//Express web server
const express = require('express');
//解析post回來的資料(request body)
const bodyParser = require('body-parser');
//匯入sequelize
const Sequelize = require('sequelize'); 
//處理session的express-session套件
const session = require('express-session');
//connect-flash套件，錯誤訊息跳頁再回來後會消失
// const connectFlash = require('connect-flash');
//csrf保護機制套件
// const csrfProtection = require('csurf');

//------第三個區塊，自建模組------
// const hello = require("./hello.js");

// hello.sayHello();
// hello.sayGoodNight();

// const cowsay = require('cowsay');

// let sentences = ['哈囉', '安安', '我是牛牛'];

// sentences.forEach((sentence) => {
//     console.log(cowsay.say({
//         text : sentence,
//         e : "^^",
//         T : "U "
//     }));
// });

//回傳 HTTP 狀態碼與網頁內容
// const server = http.createServer((req, res) => {
//     if (req.url === '/') {
//         return res.end('This is home page');
//     } 
// 		if (req.url === '/login') {
//             res.writeHead(200, { 'Content-Type': 'text/html' }); //statusCode, MIME type
//             return res.end('<h1>This is login page</h1>');
//     } 
//     res.end('page not found :(');
// });

// server.listen(3000, () => {
// 	console.log('Web Server is running on port 3000');
// });

//使用 url 模組來分析 URL
// const url = require('url');

// console.log(url.parse('https://www.notion.so/e6889306d6e44a328b85a2b188f5a36a?v=d331e5cab96e497f9499181fce10bf76'));

const app = express();
const port = 3000; //web server運行的port，方便維護
const oneDay = 1000*60*60*24; //for session儲存時間

//引入utils的database模組
const database = require('./utils/database');
//引入auth.js的模組
const authRoutes = require('./routes/auth');
//引入shop.js的模組
const shopRoutes = require('./routes/shop');
//引入error.js的模組
const errorRoutes = require('./routes/error');
//引入models的Product模組
const Product = require('./models/product');
//引入models的User模組
const User = require('./models/user');
//引入models的Cart模組
const Cart = require('./models/cart');
//引入models的CartItem模組
const CartItem = require('./models/cart-item');

//------middleware (由上而下執行)------

//設定ejs
// app.set('view engine', 'ejs'); //使用ejs的view engine樣板引擎
// app.set('views', 'views'); // views的預設路徑就是views資料夾，如果沒有變動，可以省略此設定

//告知靜態資源存放路徑
app.use(express.static(path.join(__dirname, 'public')));

// app.use((req, res, next) => {
// 	console.log('Hello!');
// 	next(); //自定義的函式要加上next()讓電腦知道該中介軟體已結束，要進入下一個
// });

// app.use((req, res, next) => {
// 	console.log('World!');
// 	res.end();
// });

//使用bodyParser解析post回來的資料(request body)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//使用connect-flash模組
// app.use(connectFlash());

//使用express-session中介軟體的函式
app.use(session({ 
	secret: 'sessionToken',  // 加密用的字串
	resave: false,   // 沒變更內容是否強制回存
	saveUninitialized: false ,  // 新 session 未變更內容是否儲存
	cookie: {
		maxAge: oneDay // session 狀態儲存多久？單位為毫秒
	}
})); 

//使用csrf模組，要放在express和bodyParser之後
// app.use(csrfProtection());

app.use((req, res, next) => {
    //res.locals, session都是express-session設定的全域變數，每個模板都可以使用
    //把path存到全域變數，後續可以直接使用，render時不用再傳入path參數
    res.locals.path = req.url;
    //把isLogin存在全域變數，登入狀態(布林值)
    res.locals.isLogin = req.session.isLogin || false;
    //把csrfToken存在全域變數
    // res.locals.csrfToken = req.csrfToken();
    next();
});

//使用 req.session.user 資料，接著查詢資料庫關於這個使用者的細節資訊，並把它存放到全域變數中（req.user）
app.use((req, res, next) => {
    if (!req.session.user) { //沒有資料表示沒有登入
        return next();
    }
	//如果已登入的話，findByPk:find by primary key，用id去找，取得該id的user model，為了拿到sequelize的方法，純資料無法使用這些方法
    User.findByPk(req.session.user.id)
        .then((user) => {
            req.user = user;
            next();
        })
        .catch((err) => {
            console.log('custom middleware - findUserBySessionId error: ', err);
        })
});


//使用auth.js的模組
app.use(authRoutes);
//使用shop.js的模組
app.use(shopRoutes);
//使用error.js的模組
app.use(errorRoutes);

//用sequelize提供的方法建立關係
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

//引入products產品資料來bulkCreate(products)倒入資料庫
const products = require('./products');

// app.listen(3030, () => {
// 	console.log('Web Server is running on port 3030');
// });
//改寫成promise:
database
    //因為要測試資料，先清空reset再開始執行，之後可以拿掉
	// .sync({ force: true }) //和DB連線時，強制重設DB
    .sync()
	.then((result) => {
        // User.create({ displayName: 'Admin', email: 'admin@skoob.com', password: '11111111'})
        //bulkCreate(array):輸入多筆資料的方法 
        // Product.bulkCreate(products);
		app.listen(port, () => {
			console.log(`Web Server is running on port ${port}`);
		});
	})
	.catch((err) => {
		console.log('create web server error: ', err);
	});


// const products = [
//     {
//         title: '黑芝麻花生脆餅',
//         category: '手工餅乾',
//         price: 250,
//         description: '無麩質 天然純手工製作 低溫烘焙，非油炸 無添加防腐劑, 無香料, 無蔗糖 保留完整營養 嚴選天然飽滿日本黑芝麻 搭配低溫烘焙台灣台農11號花生 雙重口味的撞擊味蕾 細緻酥脆的口感',
//         imageUrlOne: '',
//         imageUrlTwo: ''
//     },
//     {
//         title: '經典原味拿花曲奇',
//         category: '手工餅乾',
//         price: 260,
//         description: '超美又酥鬆的擠花餅乾 也是店裡人氣不墜商品之一 減糖70% 酥酥鬆鬆好口感 烘焙是一種精彩的科學和藝術, 因為減糖, 就要精算其他粉類的黃金比例, 外在氣候環境濕度...... 等等的影響, 店裡拿花餅乾都有一群無敵愛好者支持, 在製作擠花曲奇餅乾也是我四年來進入烘焙世界最最舒壓開心的時光之一, 常常不知不覺就擠了滿滿三大盤, 美美的出場啊~~~',
//         imageUrlOne: '',
//         imageUrlTwo: ''
//     },
//     {
//         title: '濃情可可酥餅',
//         category: '手工餅乾',
//         price: 260,
//         description: '尖叫聲!!! 璐緹 [香濃可可曲奇] 華麗登場 酥酥鬆鬆 可可對人體的好處很多, 這款帶有苦巧克力的獨特風味, 讓你安心輕鬆吃以及少糖少油的零嘴, 也是我們店內大人小孩都滿意的手工餅乾之一, 常常是家裡小朋友指定的常備點心之一. 可可的好處還提供身體營養元素之一, 抗發炎防失智唷!',
//         imageUrlOne: '',
//         imageUrlTwo: ''
//     },
//     {
//         title: '綜合曲奇餅乾罐',
//         category: '手工餅乾',
//         price: 270,
//         description: '想到零食 你絕對不能少了它！ 滿滿一大罐 各式規格種類餅乾 值得推薦 防疫健康糧食 減糖版本 下午茶零食/辦公室團購/會議點心/伴手禮.. 完全大大滿足你的需求',
//         imageUrlOne: '',
//         imageUrlTwo: ''
//     },
//     {
//         title: '手工南瓜子海苔堅果薄片',
//         category: '手工餅乾',
//         price: 270,
//         description: '酥酥脆脆的口感, 灑上海苔粉, 是這款點心的一大亮點, 再搭配滿滿的南瓜子, 每一口都幸福啊~',
//         imageUrlOne: '',
//         imageUrlTwo: ''
//     },
//     {
//         title: '手工杏仁花生堅果薄片',
//         category: '手工餅乾',
//         price: 280,
//         description: '六年多我們累積了一群鐵粉, 這款堅果薄片, 也是鐵粉們必備的零食之一 酥酥脆脆的口感, 搭配滿滿的杏仁跟花生堅果, 每一口都幸福啊~ 堅持純手作 減糖70% 一直是我們的堅持 最要謝謝忠實顧客一直以來的支持與照顧',
//         imageUrlOne: '',
//         imageUrlTwo: ''
//     },
//     {
//         title: '杏仁核桃奶酥餅乾',
//         category: '手工餅乾',
//         price: 290,
//         description: '核核營養價值豐富堪稱堅果類之王 也是養生之寶 這款餅乾也是減糖版, 深受小朋友喜歡, 媽媽們的口袋第一名商品, 口感酥脆, 滿滿的核桃, 越是咀嚼越發香濃厚實 店裡回購率最高商品之一唷~',
//         imageUrlOne: '',
//         imageUrlTwo: ''
//     },
//     {
//         title: '香濃抹茶杏仁酥餅',
//         category: '手工餅乾',
//         price: 330,
//         description: '大家都愛的幸福味道 我的一群抹茶控顧客們, 總是不忘給我功課, 激發我的爆發力~~~ 來來來, 這款抹茶造型樸實無華, 我添加了杏仁角, 增加酥脆口感, 一口咬住的當下, 香淳濃郁的滋味實在難以忘懷. 只是現在現磨抹茶粉食材實在太貴啦, 大家省著吃啊呀呀~~~~ 抹茶控們 快快照過來!!!',
//         imageUrlOne: '',
//         imageUrlTwo: ''
//     },
//     {
//         title: '燕麥胚芽堅果餅',
//         category: '手工餅乾',
//         price: 330,
//         description: '高比例燕麥搭配豐富的堅果 高纖少糖美味 營養又飽足 堅持少糖少油純手作餅乾 很多客戶會買回去給家裡長輩當下午茶點心 這款非常適合血糖控制和講求低碳水化合物健康飲食的朋友們 採用最簡單最快速的方式 將所有材料研磨成一定的大小細度 讓大人們享受下午茶時光 讓家裡大人們一起享受美味的減糖點心',
//         imageUrlOne: '',
//         imageUrlTwo: ''
//     },
// ];