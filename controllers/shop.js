const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const order = require('../models/order');
const Product = require('../models/product');

const Order = require('../models/order');

exports.getIndex = (req, res, next) => {
  Product.find().then((products) => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  });
};

exports.getProducts = (req, res, next) => {
  Product.find().then((products) => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'Shop',
      path: '/products'
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
      totalQuantity: 100
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
        orders: orders
      });
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error);
    });
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
        email: req.user.email,
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
    path: '/checkout'
  });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
  .then(order => {
    if(!order) {
      return next(new Error('No such a order in DB!'));
    }

    if(order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error('Unauthorized'));
    }


  const invoiceName = `invoice-${orderId}.pdf`;
  const invoicePath = path.join('data', 'invoices', invoiceName);
  // fs.readFile(invoicePath, (err, data) => {
  //   if(err) {
  //     return next(err);
  //   }

  //   res.setHeader('Content-Type', 'application/pdf');
  //   //res.setHeader('Content-Disposition', 'attachement; filename="' + invoiceName + '"'); //plik się ściąga
  //   res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"'); //plik się otwiera w przeglądarce
  //   res.send(data);
  // });
  //------------------------------------------------------------------
  // //Striming of file instead downloading it.

  // const file = fs.createReadStream(invoicePath);
  // res.setHeader('Content-Type', 'application/pdf');
  // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"'); //plik się otwiera w przeglądarce

  // file.pipe(res);
  //------------------------------------------------------------------

  const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      });
      pdfDoc.text('-----------------------');
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              ' - ' +
              prod.quantity +
              ' x ' +
              '$' +
              prod.product.price
          );
      });
      pdfDoc.text('---');
      pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

      pdfDoc.end();
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error);
    });

};