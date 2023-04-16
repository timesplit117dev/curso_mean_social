'use strict'

var express = require('express');
var PublicationController = require('../controllers/publication');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

var multiparty = require('connect-multiparty');
var md_upload = multiparty({uploadDir: './uploads/publications'})

api.post('/publication', md_auth.ensureAuth, PublicationController.savePublication);
api.get('/publications/:page?', md_auth.ensureAuth, PublicationController.getPublications);
api.get('/publicationsUser/:user/:page?', md_auth.ensureAuth, PublicationController.getPublicationsUser);
api.get('/getPublication/:id', md_auth.ensureAuth, PublicationController.getPublication);
api.delete('/deletePublication/:id', md_auth.ensureAuth, PublicationController.deletePublication);
api.post('/publicationUpload_image/:id', [md_auth.ensureAuth, md_upload], PublicationController.uploadImage);
api.get('/publicationGetImage/:imageFile', PublicationController.getImageFile);

module.exports = api;