const mongodb = require('mongodb');
const objectId = mongodb.ObjectID;

const getDb = require('../util/database').getDb;

class User {
  constructor(username, email) {
    this.name = username;
    this.email = email;
  }

  save() {
    const db = getDb();
    return db
      .collection('users')
      .insertOne(this);
  }

  static findUserById(id) {
    const db = getDb();
    return db
      .collection('users')
      .findOne({_id: objectId(id)});
  }
}

module.exports = User;
