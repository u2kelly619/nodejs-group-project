//匯入user模組
const User = require('../models/user');
//匯入加密密碼的模組bcryptjs
const bcryptjs = require('bcryptjs');

//變成一個function
// const getLogin = (req, res) => {
//     // const errorMessage = req.flash('errorMessage')[0];
//     // res.status(200).sendFile(path.join(__dirname, 'views', 'login.html')); //把node資料夾>views>login.html的檔案拿來顯示
//     res.status(200)
//         // .render('auth/login',{ //render會去views資料夾抓
//         // pageTitle: 'Login',
//         // // path: '/login' //全域已有定義(app.js內處理login狀態時有設定 res.locals.path = req.url)，但這邊再寫一次的話權重更高，會覆寫
//         // errorMessage //render時將errorMessage傳進login視圖
//         // });
// }

// const getSignup = (req, res) => {
//     // const errorMessage = req.flash('errorMessage')[0];
//     res.status(200)
//         // .render('auth/signup', {
//         //     pageTitle: 'Signup',
//         //     errorMessage
//         // });
// }

const postLogin = (req, res)=>{
    let{email, password} = req.body
    console.log(email, password);
    User.findOne({
        where: {email}
    })
    .then((user)=>{
        if(user){
            console.log(user)
            //比對密碼
            bcryptjs
            //用bcryptjs的compare函式比較使用者輸入的密碼和資料庫內的密碼
            .compare(password, user.password)
            .then((isMatch) => {
                if (isMatch) {
                    // 把user資料存在session
                    req.session.user = user;
                    req.session.isLogin = true;
                    req.session.save((err) => {
                        console.log('postLogin - save session error: ', err);
                    });
                    console.log("login success")
                    return res.send({loginSuccess:1})
                } else {
                    //不匹配回到login頁，顯示錯誤訊息
                    console.log("password incorrect")
                    return res.send({loginSuccess:2})
                }
            })
            .catch((err) => {
                console.log(err);
            })
        }
        else{
            console.log('no user');
            return res.send({loginSuccess:0})
        }
    })
}


const postSignup = (req, res)=>{
    let {displayName, email, password} = req.body
    User.findOne({ where: { email } })
        .then((user)=>{
            if(user){
                return res.send({hasUser:1})
            } else{
                bcryptjs.hash(password, 12)
                .then((hashedPassword)=>{
                    User.create({ displayName, email, password: hashedPassword })
                    .then((newUser) => {
                        //註冊時一併建立user的cart
                        //因為有建立cart跟user間的關係，createCart()會建立cart中的一筆帶有userId資料
                        newUser.createCart();
                    })
                    return res.send({hasUser:0})
                })
                .catch((err) => {
                    console.log('create new user error: ', err);
                })
            }
        })
        .catch((err)=>{
            console.log('signup_error', err);
        })
    
}

const postLogout = (req, res) => {
    //destroy()清除session，要傳入一個callback function
    req.session.destroy((err) => {
        console.log('session destroy() error: ', err);
        // return res.send({ loginStatus:0 })
    });
}

const loginStatus = (req, res) => {
    if(res.locals.isLogin){
        return res.send({ loginStatus:1 })
    } else {
        return res.send({ loginStatus:0 })
    }

}

//建議用物件寫法
module.exports = {
    // getLogin, //getLogin: getLogin
    // getSignup,
    postLogin,
    postSignup,
    postLogout,
    loginStatus
}