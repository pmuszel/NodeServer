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
    // const cartProduct = this.cart.items.findIndex(
    //   (cp) => cp._id === product._id
    // );

    const updatedCart = { items: [{ productId: new objectId(product._id), quantity: 1 }] };

    const db = getDb();
    return db
      .collection('users')
      .updateOne({ _id: objectId(this._id) }, { $set: { cart: updatedCart } });
  }

  static findUserById(id) {
    const db = getDb();
    return db.collection('users').findOne({ _id: objectId(id) });
  }
}

module.exports = User;
