const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

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

const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './images');
  },
  filename: (req, file, callback) => {
    const firstPart = new Date().toISOString().replace(/:/g, '-');
    console.log(firstPart);
    callback(null, firstPart + '_' + file.originalname);
  }
});

const fileFilter = (req, file, callback) => {
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    callback(null, true);
  } else {
    callback(null, false);
  }
}

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

const accesLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

app.use(helmet());
app.use(compression());
app.use(morgan('combined', {stream: accesLogStream}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));


app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images'))); // musi być '/images' na początku, gdyż inczej szuka plików w root folder jak path jest do /images/[file_name]

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

// app.use((error, req, res, next) => { // łapie wszystkie catch, gdzie wywołujemy next(error) 
//   res.status(500).render('500', { pageTitle: 'Error', path: '/500', isAuthenticated: req.session ? req.session.isLoggedIn : false });
// });

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
