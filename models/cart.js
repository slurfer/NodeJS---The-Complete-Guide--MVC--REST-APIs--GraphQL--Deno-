const fs = require("fs");
const path = require("path");

const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "cart.json"
);

const saveToFile = (content) => {
  fs.writeFile(p, JSON.stringify(content), (err) => {
    console.log(err);
  });
};

const getCartFromFile = (cb) => {
  fs.readFile(p, (err, fileContent) => {
    let cart = { products: [], totoalPrice: 0 };
    if (!err) {
      cart = JSON.parse(fileContent);
    }
    cb(cart);
  });
};

module.exports = class Cart {
  static addProduct(id, productPrice) {
    // Fetch the previous cart
    getCartFromFile((cart) => {
      // Analyze the cart => Find existing product
      const existingProductIndex = cart.products.findIndex(
        (prod) => prod.id === id
      );
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      // Add new product/increase the quantity
      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id: id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totoalPrice = cart.totoalPrice + +productPrice;
      saveToFile(cart);
    });
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(p, (err, cart) => {
      if (err) {
        return;
      }
      const updatedCart = { ...JSON.parse(cart) };
      if (updatedCart.products.length === 0){
        return;
      }
      const product = updatedCart.products.find((prod) => prod.id === id);
      const procutQty = product.qty;
      updatedCart.totoalPrice =
        updatedCart.totoalPrice - procutQty * productPrice;
      updatedCart.products = updatedCart.products.filter(
        (prod) => prod.id !== id
      );
      saveToFile(updatedCart);
    });
  }

  static getCart(cb) {
    fs.readFile(p, (err, fileContent) => {
      const cart = JSON.parse(fileContent);
      if (err) {
        cb(null)
      }else{
        cb(cart);
      }
    })
  }
};
