const mongodb = require('mongodb');
const objectId = mongodb.ObjectID;

const getDb = require('../util/database').getDb;

class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    if(id) {
      this._id = objectId(id);
    }
    this.userId = userId;
  }

  save() {
    const db = getDb();
    let dbOp;
    if (this._id) {
      dbOp = db.collection('products').updateOne({_id: objectId(this._id)}, {$set: this});
    } else {
      dbOp = db.collection('products').insertOne(this);
    }
    return dbOp
      .then(result => console.log(result))
      .catch((err) => console.log(err));
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection('products')
      .find()
      .toArray()
      .then((products) => products)
      .catch((err) => console.log(err));
  }

  static findById(id) {
    const db = getDb();
    return db
      .collection('products')
      .findOne({ _id: objectId(id) })
      .then((product) => product)
      .catch((err) => console.log(err));
  }

  static deleteById(id) {
    const db = getDb();
    return db
      .collection('products')
      .deleteOne({ _id: objectId(id) })
      //.then((product) => product)
      .catch((err) => console.log(err));
  }
}

module.exports = Product;
