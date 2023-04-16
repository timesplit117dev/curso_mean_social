"use strict";

var mongoose = require("mongoose");
var port = 3800;
var app = require("./app");
const server = require('http').createServer(app);

//Conexión DB.
mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://127.0.0.1:27017/curso_mean_social")
  .then(() => {
    console.log("Conectado a base de datos");

    server.listen(port, function () {
      console.log(`Servidor en puerto ${port}`);

      const messageController = require('./controllers/message');
      const io = require("socket.io")(server, {
        cors: { origin: "http://localhost:4200" }
      });
      messageController.messageWebSocket(io);

    });

  })
  .catch((err) => console.log(err));