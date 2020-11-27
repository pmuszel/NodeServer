const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;

const User = require('./models/user');

//const expressHbs = require('express-handlebars');

const app = express();

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

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findUserById('5fc0f25a565993ea0129f872')
    .then(user => { (req.user = user);
        next();
    })
    .catch((err) => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.pageNotFound);

mongoConnect(() => {
  app.listen(3000);
});
