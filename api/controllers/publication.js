'use strict'

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');

async function savePublication(req, res){

    var params = req.body;
    if (!params.text) return res.status(500).send({message: "Debes enviar el texto"});

    var publication = new Publication();
    publication.text = params.text;
    publication.file = 'null';
    publication.user = req.user.sub;
    publication.created_at = moment().unix();

    try {

        const publicationStored = await publication.save();
        if (!publicationStored) return res.status(404).send({message: "La publicación no se ha guardado"});

        res.status(200).send({publication: publicationStored});

    } catch (error) {
        return res.status(500).send({message: "Error en la petición: "+error});
    }

}

async function getPublications(req, res){

    var page = 1;
    if (req.params.page)
        page = req.params.page;

    var itemsPerPage = 2;

    try {

        //Obtenemos a los usuarios que seguimos, solo queremos el campo followed.
        const follows = await Follow.find({user: req.user.sub}).select({'_id':0, '__v':0, 'user':0});

        //Hacemos array.
        var follows_clean = [];
        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });

        //Nos añadimos a nosotros mismos, para ver nuestras publicaciones.
        follows_clean.push(req.user.sub);

        //Buscamos las publicaciones de los usuarios que seguimos, ordenamos de forma descendente.
        const publications = await Publication.find({user: {$in: follows_clean}})
                                              .sort('-created_at')
                                              .populate('user')
                                              .paginate(page, itemsPerPage);

        if (!publications) return res.status(404).send({message: "No hay publicaciones"});

        const total = await Publication.countDocuments({user: {$in: follows_clean}});

        res.status(200).send({
            page: page,
            pages: Math.ceil(total/itemsPerPage),
            total: total,
            publications,
            itemsPerPage
        });

    } catch (error) {
        return res.status(500).send({message: "Error en la petición: "+error});
    }

}

async function getPublicationsUser(req, res){

    var page = 1;
    if (req.params.page)
        page = req.params.page;

    var itemsPerPage = 2;

    var user = req.params.user;

    try {

        //Buscamos las publicaciones de los usuarios que seguimos, ordenamos de forma descendente.
        const publications = await Publication.find({user: user})
                                              .sort('-created_at')
                                              .populate('user')
                                              .paginate(page, itemsPerPage);

        if (!publications) return res.status(404).send({message: "No hay publicaciones"});

        const total = await Publication.countDocuments({user: user});

        res.status(200).send({
            page: page,
            pages: Math.ceil(total/itemsPerPage),
            total: total,
            publications,
            itemsPerPage
        });

    } catch (error) {
        return res.status(500).send({message: "Error en la petición: "+error});
    }

}

async function getPublication(req, res){

    var publicationId = req.params.id;

    try {

        const publication = await Publication.findById(publicationId);
        if (!publication) return res.status(404).send({message: "No se ha podido obtener la publicación"});

        res.status(200).send({publication});


    } catch (error) {
        return res.status(500).send({message: "Error en la petición: "+error});
    }

}

async function deletePublication(req, res){

    var publicationId = req.params.id;

    try {

        const publicationDeleted = await Publication.deleteOne({_id: publicationId, user: req.user.sub});
        if (publicationDeleted.deletedCount == 0) return res.status(404).send({ message: "No se ha eliminado el publication, posiblemente no exista" });
        return res.status(200).send({ message: "Se ha eliminado la publicación" });


    } catch (error) {
        return res.status(500).send({message: "Error en la petición: "+error});
    }

}

async function uploadImage(req, res){

    var publicationId = req.params.id;

    if (req.files.image) {

        var file_path = req.files.image.path;
        var file_split = file_path.split('\/');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if (file_ext == 'png' ||
            file_ext == 'jpg' ||
            file_ext == 'jpeg' ||
            file_ext == 'gif') {
            
            try {
                
                //Comprobamos que la publicación es nuestra.
                const checkPublication = await Publication.findOne({_id: publicationId, user: req.user.sub});
                if (!checkPublication) return removeFilesOfUploads(res, file_path, "No existe la publicación o no tienes permisos");

                //Actualizamos la publicación con la imagen.
                const publicationUpdated = await Publication.findByIdAndUpdate(publicationId, {file: file_name}, {new: true});
                if (!publicationUpdated) return res.status(404).send({message: "No se ha podido actualizar la publicación"});
                return res.status(200).send({publicationUpdated});

            } catch (error) {
                return removeFilesOfUploads(res, file_path, "Error en la petición: "+error);
            }

        }
        else{
            return removeFilesOfUploads(res, file_path, "Formato de imagen incorrecto");
        }

    }
    else{
        return res.status(200).send({message: "No se han subido archivos"});
    }

}

function removeFilesOfUploads(res, file_path, message){
    //Eliminar fichero.
    fs.unlink(file_path, (err) => {
        return res.status(500).send({message: message});
    });
}

function getImageFile(req, res){

    var image_file = req.params.imageFile;
    var path_file = './uploads/publications/'+image_file;

    console.log(image_file);
    if (fs.existsSync(path_file))
        res.sendFile(path.resolve(path_file));
    else
        return res.status(500).send({message: "No existe la imagen..."});

}

module.exports = {
    savePublication,
    getPublications,
    getPublicationsUser,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile
}