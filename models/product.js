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
  constructor(title) {
    this.title = title;
  }

  save() {
    getProductsFromFile((products) => {
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), (err) => console.log(err));
    });
  }

  static fetchAll(callBack) {
    getProductsFromFile(callBack);
  }
};
