const fs = require('fs');
const path = require('path');
const rootPath = require('../util/path');

const p = path.join(rootPath, 'data', 'cart.json');

module.exports = class Cart {

    static addProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            let cart = {products: [], totalPrice: 0};
            if(!err) {
                cart = JSON.parse(fileContent);
            }

            const existingProductIndex = cart.products.findIndex(p => p.id === id);
            const existingProduct = cart.products[existingProductIndex]
            let updatedProduct;

            if(existingProduct) {
                updatedProduct = {...existingProduct};
                updatedProduct.qty++;
                cart.products[existingProductIndex] = updatedProduct;
            } else {
                updatedProduct = {id: id, qty: 1};
                cart.products.push(updatedProduct);
            }

            console.log(cart);

            cart.totalPrice = cart.totalPrice + +productPrice; 
            fs.writeFile(p, JSON.stringify(cart), err => {
                console.log(err);
            });
        });
    }

    static deleteProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            if(err) {
                return;
            }
            const cart = JSON.parse(fileContent);
            const updatedCart = {...cart}
            const product = updatedCart.products.find(p => p.id === id);
            
            if(!product) {
                return;
            }

            const productQty = product.qty;
            updatedCart.products = updatedCart.products.filter(p => p.id !== id);
            updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty;

            fs.writeFile(p, JSON.stringify(updatedCart), err => {
                console.log(err);
            });
        });
    }

    static getCart(callback) {
        fs.readFile(p, (err, fileContent) => {
            const cart = JSON.parse(fileContent);

            if(err) {
                callback(null);
            } else {
                callback(cart);
            }
        });
    };
}