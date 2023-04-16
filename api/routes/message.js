'use strict'

var express = require('express');
var MessageController = require('../controllers/message');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/message', md_auth.ensureAuth, MessageController.saveMessage);
api.get('/messages/:page?', md_auth.ensureAuth, MessageController.getMessagesSocket);
api.get('/messagesReceived/:page?', md_auth.ensureAuth, MessageController.getReceivedMessages);
api.get('/messagesEmitted/:page?', md_auth.ensureAuth, MessageController.getEmmitMessages);
api.get('/messagesUnviewed', md_auth.ensureAuth, MessageController.getUnviewedMessages);
api.get('/messagesSetViewed', md_auth.ensureAuth, MessageController.setViewedMessages);

module.exports = api;