'use strict'
var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');

var User = require('../models/user');
var Follow = require('../models/follow');
var Publication = require('../models/publication');
var jwt = require('../services/jwt');

async function saveUser (req, res){

    var params = req.body;
    var user = new User();

    if (params.name && params.surname && params.nick && params.email && params.password) {
        
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        try {
            const users = await User.find({ $or: [
                {email: user.email.toLowerCase()},
                {nick: user.nick.toLowerCase()}
            ]});

            if (users.length > 0)
                return res.status(500).send({message: "Ya existe el usuario"});

        } catch (error) {
            return res.status(500).send({message: "La consulta de verificar el usuario ha petado"});
        }

        bcrypt.hash(params.password, null, null, async (err, hash) => {

            user.password = hash;

            try {
                const userStored = await user.save();
                if (userStored) {
                    res.status(200).send({user: userStored});
                }else{
                    res.status(400).send({message: 'No se ha registrado el usuario'});
                }
            } catch (error) {
                return res.status(500).send({message: 'Error al guardar el usuario: '+error});
            }
            
        });

    }
    else{

        res.status(200).send({
            message: 'Faltan campos por informar.'
        });

    }

}

async function loginUser(req, res){

    var params = req.body;

    var email = params.email;
    var password = params.password;

    try {

        const user = await User.findOne({email: email});

        if (user) {
            
            const validation = ((error, check) => {
                if (check) {

                    if (params.gettoken) {
                        user.password = undefined;
                        return res.status(200).send({
                            token: jwt.createToken(user),
                            user: user
                        });
                    }
                    else{
                        user.password = undefined;
                        return res.status(200).send({user});
                    }
                    
                }
                else{
                    return res.status(404).send({message: 'Contraseña incorrecta'});
                }
            });
            bcrypt.compare(password, user.password, validation);

        }
        else{
            return res.status(404).send({message: 'El usuario no existe'});
        }

    } catch (error) {
        return res.status(500).send({message: 'Error en la consulta: '+error});
    }

}

//Devuelve los datos de un usuario que se pasa como ID.
async function getUser(req, res){

    var userId = req.params.id;

    try {

        const user = await User.findById(userId);

        if (!user) return res.status(404).send({message: "El usuario no existe"});

        //Miramos si el usuario logeado está siguiendo al usuario que ha buscado.
        const following = await Follow.findOne({user: req.user.sub, followed: userId});
        //Miramos si el usuario que hemos buscado nos sigue al usuario logeado.
        const followed = await Follow.findOne({user: userId, followed: req.user.sub});

        return res.status(200).send({user, following, followed});

    } catch (error) {
        return res.status(500).send({message: "Error en la petición: "+error});
    }

}

async function getUsers(req, res){

    var identity_user_id = req.user.sub;

    var page = 1;

    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 2;

    try {
        
        const users = await User.find().sort('_id').paginate(page, itemsPerPage);

        if (!users) return res.status(404).send({message: "No hay usuarios disponibles"});

        const total = await User.countDocuments();

        var following_clean = [];
        var followed_clean = [];

        //Buscamos los usuarios a los que seguimos.
        const following = await Follow.find({user: identity_user_id}).select({_id: 0, __v:0, user:0});
        //Buscamos a los usuarios que nos siguen.
        const followed = await Follow.find({followed: identity_user_id}).select({_id: 0, __v:0, followed:0});

        //Rellenamos arrays.
        following.forEach((follow) =>{
            following_clean.push(follow.followed);
        });

        followed.forEach((follow) =>{
            followed_clean.push(follow.user);
        });

        return res.status(200).send({
            users,
            following_clean,
            followed_clean,
            total,
            pages: Math.ceil(total/itemsPerPage)
        });

    } catch (error) {
        return res.status(500).send({message: "Error en la petición: "+error});
    }

};

async function getCounters(req, res){

    var userId = req.user.sub;
    if (req.params.id){
        userId = req.params.id;
    }
    
    try {

        const following = await Follow.countDocuments({user: userId});
        const followed = await Follow.countDocuments({followed: userId});
        const publications = await Publication.countDocuments({user: userId});

        res.status(200).send({
            following,
            followed,
            publications
        });

    } catch (error) {
        return res.status(500).send({message: "Error en la petición: "+error});
    }

}

async function updateUser(req, res){

    var userId = req.params.id;
    var update = req.body;

    delete update.password;

    //req.user.sub se rellena en el middleware
    if (userId != req.user.sub) {
        return res.status(500).send({message: "No tienes permisos para actualizar los datos del usuario"});
    }

    try {

        //Buscamos usuarios que tengan el email o nick que se quiere actualizar.
        const users = await User.find({ $or: [
            {email: update.email.toLowerCase()},
            {nick: update.nick.toLowerCase()}
        ]});

        //Si hemos encontrado alguno, comprobamos que no sea el mismo usuario que se está actualizando, para dar error.
        var user_error = false;
        if (users.length > 0){
            users.forEach((user) => {
                if (user._id != userId) user_error = true;
            });
        }

        if (user_error) return res.status(500).send({message: "Ya existe el usuario"});
        
        //Al indicar el new, nos devuelve el objeto actualizado y no el original.
        const userUpdated = await User.findByIdAndUpdate(userId, update, {new: true});
        if (!userUpdated) return res.status(404).send({message: "No se ha podido actualizar el usuario"});
        return res.status(200).send({user: userUpdated}); 

    } catch (error) {
        return res.status(500).send({message: "Error en la petición: "+error});
    }

}

async function uploadImage(req, res){

    var userId = req.params.id;

    if (req.files.image) {

        var file_path = req.files.image.path;
        var file_split = file_path.split('\/');
        var file_name = file_split[2];

        //req.user.sub se rellena en el middleware
        if (userId != req.user.sub) {
            return removeFilesOfUploads(res, file_path, "No tienes permisos para actualizar los datos del usuario");
        }

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if (file_ext == 'png' ||
            file_ext == 'jpg' ||
            file_ext == 'jpeg' ||
            file_ext == 'gif') {
            
            try {

                //Antes de actualizar la imagen, vamos a obtener la anterior para eliminarla.
                const userImage = await User.findById(userId).select('image');

                const userUpdated = await User.findByIdAndUpdate(userId, {image: file_name}, {new: true});    
                if (!userUpdated) return res.status(404).send({message: "No se ha podido actualizar el usuario"});

                //Como se ha actualizado correctamente, vamos a borrar la anterior imagen en caso de que tuviera.
                if (userImage.image) {
                    var delete_path = './uploads/users/'+userImage.image;
                    fs.unlinkSync(delete_path);
                }

                return res.status(200).send({user: userUpdated}); 

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
    var path_file = './uploads/users/'+image_file;

    if (fs.existsSync(path_file))
        res.sendFile(path.resolve(path_file));
    else
        return res.status(500).send({message: "No existe la imagen..."});

}

module.exports = {
    saveUser,
    loginUser,
    getUser,
    getUsers,
    updateUser,
    uploadImage,
    getImageFile,
    getCounters
}