'use strict'

var express = require('express');
var UserController = require('../controllers/user');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

var multiparty = require('connect-multiparty');
var md_upload = multiparty({uploadDir: './uploads/users'})

api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.get('/user/:id', md_auth.ensureAuth, UserController.getUser);
api.get('/users/:page?', md_auth.ensureAuth, UserController.getUsers);
api.get('/userCounter/:id?', md_auth.ensureAuth, UserController.getCounters);
api.put('/userUpdate/:id', md_auth.ensureAuth, UserController.updateUser);
api.post('/userUpload_image/:id', [md_auth.ensureAuth, md_upload], UserController.uploadImage);
api.get('/userGetImage/:imageFile', UserController.getImageFile);

module.exports = api;