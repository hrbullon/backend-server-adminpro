var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var mdAuthentication = require('../middlewares/authentication');

var app = express();

var Usuario = require('../models/usuario');

/**==============================
 * Get all users
 *===============================*/
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role').exec((error, usuarios) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                message: 'Error cargando usuario',
                errors: error
            });
        }

        return res.status(200).json({
            ok: true,
            usuarios: usuarios
        });
    });
});

/**==============================
 * Update user
 *===============================*/
app.put('/:id', mdAuthentication.verifyToken, (req, res, next) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (error, usuario) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                message: 'Error a buscar usuario',
                errors: error
            });
        }

        if (!usuario) {
            return res.status(500).json({
                ok: false,
                message: 'El usuario con el id: ' + i + ' no existe',
                errors: error
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((error, userSaved) => {
            if (error) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar el usuario',
                    errors: error
                });
            }

            userSaved.password = ';)';

            return res.status(200).json({
                ok: true,
                usuario: userSaved
            });
        });
    });

});

/**==============================
 * Create user
 *===============================*/
app.post('/', mdAuthentication.verifyToken, (req, res, next) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((error, userSaved) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear usuario',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        return res.status(201).json({
            ok: true,
            usuario: userSaved
        });
    });
});


/**==============================
 * Delete user
 *===============================*/
app.delete('/:id', mdAuthentication.verifyToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (error, userRemoved) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                message: 'Error a borrar usuario',
                errors: error
            });
        }

        if (!userRemoved) {
            return res.status(400).json({
                ok: false,
                message: 'No existe un usuario con ese ID',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        return res.status(200).json({
            ok: true,
            usuario: userRemoved
        });
    });
});

module.exports = app;