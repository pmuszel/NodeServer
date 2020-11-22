const fs = require('fs');
const path = require('path');
const rootPath = require('../util/path');

const p = path.join(rootPath, 'data', 'products.json');

const getProductsFromFile = (callBack) => {
  fs.readFile(p, (err, fileContent) => {
    if (!err) {
      callBack(JSON.parse(fileContent));
    } else {
      callBack([]);
    }
  });
};

module.exports = class Product {
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    this.id = Math.random().toString();
    getProductsFromFile((products) => {
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), (err) => console.log(err));
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
