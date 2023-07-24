const Product = require("../models/product");
const Cart = require("../models/cart");
const { where } = require("sequelize");

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Shop",
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  // Product.findAll({ where: { id: prodId } })
  //   .then((product) => {
  //     console.log(product[0]);
  //     res.render("shop/product-detail", {
  //       product: product[0],
  //       pageTitle: product[0].title,
  //       path: "/products",
  //     });
  //   })
  //   .catch((err) => console.log(err));
  Product.findByPk(prodId)
    .then((product) => {
      console.log(product);
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((cart) => {
      return cart
        .getProducts()
        .then((cartProducts) => {
          res.render("shop/cart", {
            products: cartProducts,
            pageTitle: "All Products",
            path: "/cart",
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }
      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(prodId);
    })
    .then((product) => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity },
      });
    })
    .then(() => res.redirect("/cart"))
    .catch((err) => console.log(err));
};

exports.postCartDeleteItem = (req, res, next) => {
  const prodId = req.params.productId;
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      if (products.length > 0) {
        product = products[0];
        return product.cartItem.destroy();
      }
    })
    .then((result) => res.redirect("/cart"))
    .catch((err) => console.log(err));
};

exports.postCartCheckout = (req, res, next) => {
  let newOrder;
  req.user
    .createOrder()
    .then((order) => {
      // create new order for user
      newOrder = order;
    })
    .then(() => {
      // fetch cart
      return req.user.getCart();
    })
    .then((cart) => {
      // fetch all products in the cart
      console.log(cart.cartItem);
      return cart.getProducts();
    })
    .then((products) => {
      return products.forEach((product) => {
        // iterate through all products from the cart
        console.log("Entering new product with id: ", product.id);
        console.log("Adding the product to order");
        return (
          newOrder
            // add product to order
            .addProduct(product, {
              through: { quantity: product.cartItem.quantity },
            })
            // remove product from cart
            .then((result) => {
              console.log(
                `Product ${product.id} should be in order, removing it from cart.`
              );
              product.cartItem.destroy();
            })
        );
      });
    })
    .then((result) => {
      console.log("Transaction completed, redirecting...");
      res.redirect("/orders");
    })
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders()
    .then((orders) => {
      const ordersToBeRendered = orders.map((order) => {
        const orderItem = { id: order.id };
        return order.getProducts().then((products) => {
          orderItem.products = products;
          console.log(`order ${order.id} is in place...`)
          return orderItem;
        });
      });
      Promise.all(ordersToBeRendered)
        .then(ordersToRender => {
          console.log(ordersToRender);
          res.render("shop/orders", {
            path: "/orders",
            pageTitle: "Your Orders",
            orders: ordersToRender
          });
        })
    })
    .catch((err) => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};
