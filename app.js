if (process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')

const userRoute = require('./routes/users');
const campgroundRoute = require('./routes/campgrounds');
const reviewRoute = require('./routes/reviews');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());

// passport를 express에서 사용할 수 있도록 초기화 하는 미들웨어
app.use(passport.initialize());

// 세션을 이용한 로그인 유지 미들웨어 (사용 전 반드시 초기화 해야함)
// req.session.passport에 사용자 ID 저장
app.use(passport.session());

// paasport-local을 사용하여 username과 password를 사용하여 로그인하도록 함.
// findOne(username) 으로 사용자를 찾고 bcrypt.compare로 비밀번호가 맞는지 확인.
passport.use(new LocalStrategy(User.authenticate()));

// 사용자를 세션에 저장하는 방법 정의(로그인하면 사용자의 ID를 세션에 저장)
passport.serializeUser(User.serializeUser());

// 세션에서 사용자 정보를 가져오는 방법 정의(serializeUser()에서 저장한 사용자 ID를 기반으로 사용자 정보를 찾아 req.user에 저장)
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', userRoute);
app.use('/campgrounds', campgroundRoute);
app.use('/campgrounds/:id/reviews', reviewRoute);
;
app.get('/', (req, res) => {
    res.render('home')
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`서버 실행 중 : http://localhost:${PORT}`);
})


