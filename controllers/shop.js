const order = require('../models/order');
const Product = require('../models/product');

const Order = require('../models/order');

exports.getIndex = (req, res, next) => {
  Product.find().then((products) => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      isAuthenticated: req.session.isLoggedIn
    });
  });
};

exports.getProducts = (req, res, next) => {
  Product.find().then((products) => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'Shop',
      path: '/products',
      isAuthenticated: req.session.isLoggedIn
    });
  });
};

exports.getCart = (req, res, next) => {
  req.user.populate('cart.items.productId')
  .execPopulate()

  .then((user) => {
    const products = user.cart.items;

    res.render('shop/cart', {
      pageTitle: 'Your Cart',
      path: '/cart',
      products: products,
      totalQuantity: 100,
      isAuthenticated: req.session.isLoggedIn
    });
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  console.log(prodId);
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect('/cart');
    });
};

exports.postCardDelete = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.deleteCartItem(prodId).then((result) => {
    res.redirect('/cart');
  });
};

exports.getOrders = (req, res, next) => {
Order.find({'user.userId': req.user._id})
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {

  req.user.populate('cart.items.productId')
  .execPopulate()

  .then((user) => {
    const products = user.cart.items.map(p => {
      return {
        quantity: p.quantity,
        product: {...p.productId._doc, userId: undefined}
      }
    });

    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user
      },
      products: products
    });
    return order.save();
  })
  .then(() => {
    return req.user.clearCart();
  })
  .then((result) => {
    res.redirect('/orders');
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout',
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => console.log(err));
};
