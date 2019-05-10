var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (error, user) => {

        if (error) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: error
            });
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas - email',
                errors: error
            });
        }

        if (!bcrypt.compareSync(body.password, user.password)) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas - password',
                errors: error
            });
        }

        //Crear token
        user.password = ';)';
        var token = jwt.sign({ usuario: user }, SEED, { expiresIn: 14400 });

        return res.status(200).json({
            ok: true,
            usuario: user,
            token: token,
            id: user._id
        });
    })
});

module.exports = app;