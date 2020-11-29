const Product = require('../models/product');

exports.getIndex = (req, res, next) => {
  Product.find().then((products) => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
    });
  });
};

exports.getProducts = (req, res, next) => {
  Product.find().then((products) => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'Shop',
      path: '/products',
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
  req.user
    .getOrders()
    .then(orders => {
console.log(orders);

      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user.addOrder().then((result) => {
    res.redirect('/orders');
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout',
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
      });
    })
    .catch((err) => console.log(err));
};
