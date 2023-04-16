'use strict'

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var Message = require('../models/message');

async function saveMessage(req, res) {

    var params = req.body;

    if (!params.text || !params.receiver)
        return res.status(404).send({ message: "Envía los datos necesarios" });

    var message = new Message();
    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewed = 'false';

    try {

        const messageStored = await message.save();
        if (!messageStored) return res.status(404).send({ message: "El mensaje no se ha guardado" });

        res.status(200).send({ messageStored: messageStored });

    } catch (error) {
        return res.status(500).send({ message: "Error en la petición: " + error });
    }

}

async function getReceivedMessages(req, res) {

    var userId = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 4;

    try {

        //En el populate indicamos los campos que queremos.
        const messages = await Message.find({ receiver: userId }).populate('emitter receiver', 'name surname _id nick image').paginate(page, itemsPerPage);
        if (!messages) return res.status(500).send({ message: "No hay mensajes" });

        const total = await Message.countDocuments({ receiver: userId });

        return res.status(200).send({
            messages: messages,
            total: total,
            pages: Math.ceil(total / itemsPerPage)
        });

    } catch (error) {
        return res.status(500).send({ message: "Error en la petición: " + error });
    }

}

async function getEmmitMessages(req, res) {

    var userId = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 2;

    try {

        //En el populate indicamos los campos que queremos.
        const messages = await Message.find({ emitter: userId }).populate('emitter receiver', 'name surname _id nick image').paginate(page, itemsPerPage);
        if (!messages) return res.status(500).send({ message: "No hay mensajes" });

        const total = await Message.countDocuments({ emitter: userId });

        return res.status(200).send({
            messages: messages,
            total: total,
            pages: Math.ceil(total / itemsPerPage)
        });

    } catch (error) {
        return res.status(500).send({ message: "Error en la petición: " + error });
    }

}

async function getUnviewedMessages(req, res) {

    var userId = req.user.sub;

    try {
        const messages = await Message.countDocuments({ receiver: userId, viewed: 'false' });
        if (!messages) return res.status(200).send({ unviewed: 0 });
        return res.status(200).send({ unviewed: messages });
    } catch (error) {
        return res.status(500).send({ message: "Error en la petición: " + error });
    }

}

async function setViewedMessages(req, res) {

    var userId = req.user.sub;

    try {
        const messagesUpdated = await Message.updateMany({ receiver: userId, viewed: 'false' }, { viewed: 'true' });
        return res.status(200).send({ messages: messagesUpdated });
    } catch (error) {
        return res.status(500).send({ message: "Error en la petición: " + error });
    }

}

var auth = require('../middlewares/authenticated');
var userSockets = [];

function messageWebSocket(io) {

    io.on("connection", (socket) => {
        console.log('Cliente conectado: ' + socket.id);

        socket.on('session_start', (data) => {

            var userSocketIndex = userSockets.findIndex(userSocket => userSocket.userID == data);

            //Si encontramos el registro.
            if (userSocketIndex != -1) {
                userSockets[userSocketIndex].socketID = socket.id;
            }
            //Si no encontramos el registro.
            else {
                userSockets.push({ userID: data, socketID: socket.id });
            }
        });

        socket.on("disconnect", (reason) => {
            console.log('Cliente desconectado: ' + socket.id);
            var userSocketIndex = userSockets.findIndex(userSocket => userSocket.socketID == socket.id);
            if (userSocketIndex != -1) {
                userSockets.splice(userSocketIndex, 1);
            }
        });

        socket.on("newMessage", (token, message) => {

            var user = auth.ensureAuthSocket(token);
            if (user != '') {

                saveMessageSocket(user, message).then((result) => {
                    if (result.error) {
                        socket.emit("newMessageKO", result.message);
                    }
                    else {

                        //Si todo ha ido bien, debemos informar a quien envió en mensaje y a quien lo recibe.
                        var emitter = result.messageStored.emitter._id.toString();
                        var receiver = result.messageStored.receiver._id.toString();

                        //Buscamos el socket del emisor para ver si está conectado.
                        var emitterSocket = userSockets.find(userSocket => userSocket.userID == emitter);
                        if (emitterSocket != undefined) {
                            socket.emit("newMessageOK", result.messageStored);
                        }

                        //Buscamos el socket del receptor para ver si está conectado.
                        var receiverSocket = userSockets.find(userSocket => userSocket.userID == receiver);
                        if (receiverSocket != undefined) {
                            socket.to(receiverSocket.socketID).emit("newMessageOK", result.messageStored);
                        }

                    }
                });

            }
            else {
                socket.emit("newMessageKO", "Error de autenticación");
            }

        });

    });

}

async function saveMessageSocket(user, message) {

    var params = message;

    if (!params.text || !params.receiver)
        return { error: true, message: "Envía los datos necesarios" };

    var message = new Message();
    message.emitter = user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewed = 'false';

    try {

        const messageStored = await message.save();
        if (!messageStored) return { error: true, message: "El mensaje no se ha guardado" };

        //Obtenemos el mensaje creado.
        const messageStoredNew = await Message.findById(messageStored._id).populate('emitter receiver', 'name surname _id nick image')

        return { error: false, messageStored: messageStoredNew };

    } catch (error) {
        return { error: true, message: "Error en la petición: " + error };
    }

}

async function getMessagesSocket(req, res) {

    var userId = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 1000;

    try {

        //En el populate indicamos los campos que queremos.
        const messages = await Message.find(({
            $or: [
                { emitter: userId },
                { receiver: userId }
            ]
        })).populate('emitter receiver', 'name surname _id nick image').paginate(page, itemsPerPage);
        if (!messages) return res.status(500).send({ message: "No hay mensajes" });

        const total = await Message.countDocuments({ receiver: userId });

        return res.status(200).send({
            messages: messages,
            total: total,
            pages: Math.ceil(total / itemsPerPage)
        });

    } catch (error) {
        return res.status(500).send({ message: "Error en la petición: " + error });
    }

}

module.exports = {
    saveMessage,
    getReceivedMessages,
    getEmmitMessages,
    getUnviewedMessages,
    setViewedMessages,
    messageWebSocket,
    saveMessageSocket,
    getMessagesSocket
}