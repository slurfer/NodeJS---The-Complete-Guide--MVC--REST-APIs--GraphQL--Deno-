const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart; // {items: []}
    this._id = id ? new mongodb.ObjectId(id) : null;
  }

  save() {
    const db = getDb();
    let dbOp;
    if (this._id) {
      dbOp = db.collection("users").updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOp = db.collection("users").insertOne(this);
    }
    return dbOp
      .then((user) => {
        console.log(user);
        return user;
      })
      .catch((err) => console.log(err));
  }

  addToCart(product) {
    console.log("addToCart", product._id);
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      console.log(cp.productId, product._id);
      return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    console.log(cartProductIndex);
    if (cartProductIndex >= 0) {
      console.log("ahoj");
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: product._id,
        quantity: newQuantity,
      });
    }
    const updatedCart = {
      items: updatedCartItems,
    };
    console.log(updatedCart);
    const db = getDb();
    return db
      .collection("users")
      .updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
  }

  removeFromCart(productId) {
    const newCart = this.cart.items.filter((p) => {
      return p.productId.toString() !== productId.toString();
    });
    const product = this.cart.items.filter((p) => {
      return p.productId.toString() === productId.toString();
    })[0];
    console.log(product);
    console.log(product.quantity);
    if (product.quantity > 1) {
      product.quantity = product.quantity - 1;
      newCart.push(product);
    }
    this.cart.items = newCart;
    return this.save();
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map((i) => {
      return i.productId;
    });
    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map((p) => {
          return {
            ...p,
            quantity: this.cart.items.find((i) => {
              return i.productId.toString() === p._id.toString();
            }).quantity,
          };
        });
      });
  }

  static findById(userId) {
    const db = getDb();
    return db
      .collection("users")
      .find({ _id: new mongodb.ObjectId(userId) })
      .next()
      .then((user) => {
        return user;
      })
      .catch((err) => console.log(err));
  }
}

module.exports = User;
