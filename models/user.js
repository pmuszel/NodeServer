const mongodb = require('mongodb');
const objectId = mongodb.ObjectID;

const getDb = require('../util/database').getDb;

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection('users').insertOne(this);
  }

  addToCart(product) {
    let updatedCartItems = [];
    let cartProductIndex;

    if (this.cart && this.cart.items) {
      cartProductIndex = this.cart.items.findIndex((cp) => {
        console.log(cp.productId);
        return cp.productId.toString() === product._id.toString();
      });
      updatedCartItems = [...this.cart.items];
    }

    if (cartProductIndex > -1) {
      updatedCartItems[cartProductIndex].quantity++;
    } else {
      updatedCartItems.push({
        productId: new objectId(product._id),
        quantity: 1,
      });
    }

    const db = getDb();
    return db
      .collection('users')
      .updateOne(
        { _id: objectId(this._id) },
        { $set: { 'cart.items': updatedCartItems } }
      );
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map((i) => i.productId);
    return db
      .collection('products')
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map((p) => {
          return {
            ...p,
            quantity: this.cart.items.find(
              (x) => x.productId.toString() === p._id.toString()
            ).quantity,
          };
        });
      })
  }

  deleteCartItem(productId) {
    const updatedCartItems = this.cart.items.filter(p => p.productId.toString() !== productId.toString());
    const db = getDb();
    return db
      .collection('users')
      .updateOne(
        { _id: objectId(this._id) },
        { $set: { 'cart.items': updatedCartItems } }
      ); 
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then(products => {
        const order = {
          items: products,
          user: {
            _id: objectId(this._id),
            name: this.name
          }
        };
        return db.collection('orders').insertOne(order);
      })
      .then(result => {
        this.cart = { items: [] };
        return db
          .collection('users')
          .updateOne(
            { _id: objectId(this._id) },
            { $set: { cart: { items: [] } } }
          );
      });
  }

  getOrders() {
    const db = getDb();
    return db.collection('orders').find({"user._id" : this._id}).toArray();
  }

  static findUserById(id) {
    const db = getDb();
    return db.collection('users').findOne({ _id: objectId(id) });
  }
}

module.exports = User;
