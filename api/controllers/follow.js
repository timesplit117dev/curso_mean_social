'use strict'

var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');

async function saveFollow(req, res) {

    var params = req.body;
    var follow = new Follow();

    follow.user = req.user.sub;
    follow.followed = params.followed;

    if (!params.followed) return res.status(500).send({ message: "No se ha indicado un followed" });

    try {

        //Validamos que el id del usuario al que va a seguir exista.
        const checkUser = await User.findById(follow.followed);
        if (!checkUser) return res.status(404).send({ message: "El ID del usuario no existe" });

        //Validamos que no haga un follow duplicado.
        const checkFollow = await Follow.countDocuments({ user: follow.user, followed: follow.followed });
        if (checkFollow > 0) return res.status(404).send({ message: "Ya estás siguiendo a ese usuario" });

        const followStored = await follow.save();
        if (!followStored) return res.status(404).send({ message: "El seguimiento no se ha guardado" });
        return res.status(200).send({ follow: followStored });

    } catch (error) {
        return res.status(500).send({ message: "Error al guardar seguimiento" + error });
    }

}

async function deleteFollow(req, res) {

    var userId = req.user.sub;
    var followedId = req.params.id;

    try {

        const followDeleted = await Follow.deleteOne({ user: userId, followed: followedId });
        if (followDeleted.deletedCount == 0) return res.status(404).send({ message: "No se ha eliminado el follow, posiblemente no exista" });
        return res.status(200).send({ message: "Se ha eliminado el follow" });

    } catch (error) {
        return res.status(500).send({ message: "Error al borrar seguimiento" + error });
    }

}

async function getFollowingUsers(req, res) {

    var userId = req.user.sub;
    if (req.params.id && req.params.page) userId = req.params.id;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    } else {
        page = req.params.id;
    }

    var itemsPerPage = 2;

    try {

        //Con el populate le indicamos con path, el campo que queremos que se popule, y en el modelo debe tener una referencia.
        const follows = await Follow.find({ user: userId }).populate({ path: 'followed' }).paginate(page, itemsPerPage);
        if (!follows) return res.status(404).send({ message: "No hay follows" });

        const total = await Follow.countDocuments({ user: userId });

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total / itemsPerPage),
            follows
        });

    } catch (error) {
        return res.status(500).send({ message: "Error en la petición" + error });
    }

}

async function getFollowedUsers(req, res) {

    var userId = req.user.sub;
    if (req.params.id && req.params.page) userId = req.params.id;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    } else {
        page = req.params.id;
    }

    var itemsPerPage = 2;

    try {

        //Con el populate le indicamos con path, el campo que queremos que se popule, y en el modelo debe tener una referencia.
        const follows = await Follow.find({ followed: userId }).populate({ path: 'user' }).paginate(page, itemsPerPage);
        if (!follows) return res.status(404).send({ message: "No hay follows" });

        const total = await Follow.countDocuments({ followed: userId });

        return res.status(200).send({
            total: total,
            pages: Math.ceil(total / itemsPerPage),
            follows
        });

    } catch (error) {
        return res.status(500).send({ message: "Error en la petición" + error });
    }

}

async function getFollows(req, res){

    var userId = req.user.sub;
    var follows;

    try {

        if (req.params.followed) {
            follows = await Follow.find({followed:userId}).populate('user followed');
        } else{
            follows = await Follow.find({user:userId}).populate('user followed');
        }
        
        if (!follows) return res.status(404).send({ message: "No hay follows" });
        res.status(200).send({ follows });

    } catch (error) {
        return res.status(500).send({ message: "Error en la petición" + error });
    }

}

module.exports = {
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getFollows
}