const fs = require('fs');
const path = require('path');
const rootPath = require('../util/path');

const p = path.join(rootPath, 'data', 'products.json');


const Cart = require('./cart')

const getProductsFromFile = (callBack) => {
  fs.readFile(p, (err, fileContent) => {
    if (!err && fileContent != '') {
      callBack(JSON.parse(fileContent));
    } else {
      callBack([]);
    }
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {

    getProductsFromFile((products) => {
      if(this.id) {
        const existingProductIndex = products.findIndex(p => p.id === this.id);
        products[existingProductIndex] = this;
      } else {
        this.id = Math.random().toString();
        products.push(this);
      }
      fs.writeFile(p, JSON.stringify(products), (err) => console.log(err));
    });
  }

  static deleteById(id) {
    getProductsFromFile(products => {
      const product = products.find(p => p.id === id);
      const updatedProducts = products.filter(p => p.id !== id);
      fs.writeFile(p, JSON.stringify(updatedProducts), err => {
        if(!err) {
          Cart.deleteProduct(id, product.price);
        }
      });
    });
  }

  static fetchAll(callBack) {
    getProductsFromFile(callBack);
  }

  static findById(id, callback) {
    getProductsFromFile(products => {
      const product = products.find(p => p.id === id);
      callback(product);
    });
  }
};
