const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://root:root@cluster0.fpj93xx.mongodb.net/?retryWrites=true&w=majority"
  )
    .then((client) => {
      console.log("Connected to database.");
      callback(client);
    })
    .catch((err) => console.log(err));
};

module.exports = mongoConnect;
