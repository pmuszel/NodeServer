const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
//const mongoConnect = require('./util/database').mongoConnect;

const User = require('./models/user');

MONGODB_URI = 'mongodb+srv://devadmin:devadmin@nodeserver.sydem.mongodb.net/shop?retryWrites=true&w=majority'

//const expressHbs = require('express-handlebars');

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

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

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
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

app.use(errorController.pageNotFound);

//  mongoConnect(() => {
// //   app.listen(3000);
//  });

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    User.findOne().then(user => {
      if(!user) {
        const newUser = new User({
          name: 'Piotr Muszel',
          email: 'pmuszel@gmail.com',
          cart: {
            items: []
          }
        });
        newUser.save();
      }
    })

    app.listen(3000);
  })
  .catch((err) => console.log(err));
