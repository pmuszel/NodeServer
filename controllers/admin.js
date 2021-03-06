
const { validationResult } = require('express-validator/check');

const fileHelper = require('../util/file');

const { ObjectId } = require('mongodb');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  //const imageUrl = req.body.imageUrl;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  if(!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        //imageUrl: imageUrl,
        price: price,
        description: description
      },
      errorMessage: 'Attached file is not an image!',
      validationErrors: []
    });
  }

  const imageUrl = image.path;

  const errors = validationResult(req);

  console.log('errors');

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        //imageUrl: imageUrl,
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });

  product
    .save()
    .then((result) => res.redirect('/admin/products'))
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    res.redirect('/');
  }

  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: product.title,
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        isAuthenticated: req.session.isLoggedIn,
        csrfToken: req.csrfToken(),
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;

  const updatedTitle = req.body.title;
  //const updatedImageUrl = req.body.imageUrl;
  const updatedImage = req.file;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        //imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

Product.findById(prodId)
.then(product => {
  if(product.userId.toString() !== req.user._id.toString()) {
    res.redirect('/');
  }
  product.title = updatedTitle;
  product.price = updatedPrice;
  product.description = updatedDesc;
  if(updatedImage) {
    fileHelper.deleteFile(product.imageUrl);
    product.imageUrl = updatedImage.path;
  }

  return product.save()
  .then((result) => res.redirect('/admin/products'))
  .catch((err) => {
    const error = new Error(err)
    error.httpStatusCode = 500;
    return next(error);
  });
})
.catch((err) => {
  const error = new Error(err)
  error.httpStatusCode = 500;
  return next(error);
});
}

exports.getProducts = (req, res, next) => {
  Product.find({userId: req.user._id})
  //.select('title price') //- pobiera tylko te pola
  //.populate('userId') //- pobiera cały obiekt "User" a nie tylko jego ID
  .then((products) => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Products',
      path: '/admin/products'
    });
  });
};

// exports.postDeleteProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   Product.findById(prodId).then(product => {
//   if(!product) {
//     return next(new Error('No product of that ID!'));
//   }
//   fileHelper.deleteFile(product.imageUrl);
//   return Product.deleteOne({_id: prodId, userId: req.user._id});
// })
// .then(() => res.redirect('/admin/products'))
// .catch((err) => {
//   const error = new Error(err)
//   error.httpStatusCode = 500;
//   return next(error);
// });
  
// };

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
    Product.findById(prodId).then(product => {
    if(!product) {
      return next(new Error('No product of that ID!'));
    }
    fileHelper.deleteFile(product.imageUrl);
    return Product.deleteOne({_id: prodId, userId: req.user._id});
  })
  .then(() => {
    res.status(200).json({message: "Success!"});
  })
  .catch((err) => {
    res.status(500).json({message: 'Deleting product failed!'});
  });
}

