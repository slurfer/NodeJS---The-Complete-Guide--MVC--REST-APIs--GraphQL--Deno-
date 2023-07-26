const path = require("path");
const User = require("./models/user");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");

const mongoConnect = require("./util/database").mongoConnect;

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use((req, res, next) => {
  console.log(req.path);
  next();
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("64c12e4873dc9c1b5decba3e")
    .then((user) => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(() => {
  User.findById("64c12e4873dc9c1b5decba3e")
    .then((user) => {
      if (!user) {
        const user = new User("mdousek", "mdousek@example.com");
        return user.save().then((newUser) => {
          return newUser;
        });
      } else {
        return Promise.resolve(user);
      }
    })
    .then((user) => app.listen(3000))
    .catch((err) => console.log(err));
});
