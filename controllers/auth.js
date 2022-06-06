//匯入user模組
const User = require('../models/user');
//匯入加密密碼的模組bcryptjs
const bcryptjs = require('bcryptjs');

//變成一個function
const getLogin = (req, res) => {
    // const errorMessage = req.flash('errorMessage')[0];
    // res.status(200).sendFile(path.join(__dirname, 'views', 'login.html')); //把node資料夾>views>login.html的檔案拿來顯示
    res.status(200)
        // .render('auth/login',{ //render會去views資料夾抓
        // pageTitle: 'Login',
        // // path: '/login' //全域已有定義(app.js內處理login狀態時有設定 res.locals.path = req.url)，但這邊再寫一次的話權重更高，會覆寫
        // errorMessage //render時將errorMessage傳進login視圖
        // });
}

const getSignup = (req, res) => {
    // const errorMessage = req.flash('errorMessage')[0];
    res.status(200)
        // .render('auth/signup', {
        //     pageTitle: 'Signup',
        //     errorMessage
        // });
}

const postLogin = (req, res) => {
    const { email, password } = req.body; //ES6解構賦值，req.body為物件資料
    //findOne({條件}):回傳物件
    User.findOne({ where: { email }}) //email:email
        .then((user) => { //findOne()回傳的物件為user
            console.log('user', user);
            //如果使用者不存在，顯示錯誤訊息
			if (!user) {
                // req.flash('errorMessage', '錯誤的 Email 或 Password。');
                console.log('login: 找不到此 user 或密碼錯誤');
                // return res.redirect('/login'); //導頁在vue導
            }
			//比對密碼
            bcryptjs
				//用bcryptjs的compare函式比較使用者輸入的密碼和資料庫內的密碼
                .compare(password, user.password)
                .then((isMatch) => {
                    if (isMatch) {
                        //把user資料存在session
                        req.session.user = user;
                        req.session.isLogin = true;
                        return req.session.save((err) => {
                            console.log('postLogin - save session error: ', err);
                            // res.redirect('/'); //導頁在vue導
                        });
                    }
					//不匹配回到login頁，顯示錯誤訊息
                    req.flash('errorMessage', '錯誤的 Email 或 Password。')
                    // res.redirect('/login'); //導頁在vue導
                })
                .catch((err) => {
                    console.log(err);
                    // return res.redirect('/login'); //導頁在vue導
                })
        })
        .catch((err) => {
            console.log('login error:', err);
        });
}


const postSignup = (req, res) => {
    const { displayName, email, password } = req.body;
    User.findOne({ where: { email } }) //email: email
        .then((user) => {
            if (user) {
                // req.flash('errorMessage', '此帳號已存在！請使用其他 Email。')
                return res.redirect('/signup');
            } else {
                return bcryptjs.hash(password, 12) //加密10的12次方次
					//回傳加密的密碼hashedPassword
                    .then((hashedPassword) => {
                        return User
                        //將使用者輸入的資料和加密後的密碼寫入資料庫
                        .create({ displayName, email, password: hashedPassword });
                        })
                        .then((newUser) => {
                            //註冊時一併建立user的cart
                            //因為有建立cart跟user間的關係，createCart()會建立cart中的一筆帶有userId資料
                            return newUser.createCart();
                        })
                    .catch((err) => {
                        console.log('create new user error: ', err);
                    })
                }
        })
        .then((result) => {
            res.redirect('/login');
        })
        .catch((err) => {
            console.log('signup_error', err);
        });
}

const postLogout = (req, res) => {
    //destroy()清除session，要傳入一個callback function
    req.session.destroy((err) => {
        console.log('session destroy() error: ', err);
		//處理完後導回login頁
        res.redirect('/login');
    });
}

//建議用物件寫法
module.exports = {
    getLogin, //getLogin: getLogin
    getSignup,
    postLogin,
    postSignup,
    postLogout,
}