const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
//const mongoConnect = require('./util/database').mongoConnect;

const User = require('./models/user');

MONGODB_URI = 'mongodb+srv://devadmin:devadmin@nodeserver.sydem.mongodb.net/shop'// ?retryWrites=true&w=majority'

//const expressHbs = require('express-handlebars');

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

const csrfProtection = csrf();

//PUG View Engine
//app.set('view engine', 'pug');

//Express-handlebars View Engine
// app.engine('.hbs', expressHbs({
//     extname: '.hbs',
//     layoutsDir: 'views/layouts/',
//     defaultLayout: 'main-layout'
// }));
// app.set('view engine', 'hbs');

//EJS View Engine
app.set('view engine', 'ejs');

app.set('views', 'views');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store
}));

app.use(csrfProtection);

app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if(!user) {
        return next();
      }

      req.user = user;
      next();
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error); //next tylko w Promise, gdy kod jest synchroniczny to wystarczy throw Error()
    });
});

// app.use((req, res, next) => {
//   User.findById('5fc389eb2c2d9138e4a0164c')
//     .then((user) => {
//       //console.log(user);
//       req.user = user;//new User(user.name, user.email, user.cart, user._id);
//       next();
//     })
//     .catch((err) => console.log(err));
// });


app.use(authRoutes);
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.get('/500', errorController.page500);

app.use(errorController.pageNotFound);

app.use((error, req, res, next) => { // łapie wszystkie catch, gdzie wywołujemy next(error) 
  res.status(500).render('500', { pageTitle: 'Error', path: '/500', isAuthenticated: req.session.isLoggedIn });
});

//  mongoConnect(() => {
// //   app.listen(3000);
//  });

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    console.log('CONNECTED!');
    app.listen(3000);
  })
  .catch((err) => {
    const error = new Error(err)
    error.httpStatusCode = 500;
    return next(error);
  });
