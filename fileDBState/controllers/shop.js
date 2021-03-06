const Product = require('../models/product')
const Cart = require('../models/cart')

exports.getIndex = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
      });
  });   
};

  exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'Shop',
            path: '/products',
          });
    });   
};


exports.getCart = (req, res, next) => {
    Cart.getCart(cart => {
      Product.fetchAll(products => {
        const cartProducts = [];
        for(product of products) {
          const productCart = cart.products.find(p => p.id === product.id);
          if(productCart) {
            cartProducts.push({productData: product, qty: productCart.qty});
          }
        }
        res.render('shop/cart', {
          pageTitle: 'Your Cart',
          path: '/cart',
          products: cartProducts,
          totalQuantity: cart.totalQuantity
        });
      });

    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, product => {
    Cart.addProduct(prodId, product.price);
  });
  res.redirect('/cart');
};

exports.postCardDelete = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, product => {
    Cart.deleteProduct(prodId, product.price);
  });

  res.redirect('/cart');
};
exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
      pageTitle: 'Your Orders',
      path: '/orders',
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
  Product.findById(prodId, product => {
    res.render('shop/product-detail', {
              product: product,
              pageTitle: product.title,
              path: '/products',
            });
  });  
};



