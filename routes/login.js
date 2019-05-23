var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

//Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

/**
 * ==================================
 * Autenticación de Google
 * ==================================
 */
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
    }
}
//

app.post('/google', async(req, res) => {

    var token = req.body.token;
    var googleUser = await verify(token)
        .catch((error) => {
            return res.status(403).json({
                ok: false,
                message: 'Token no válido',
            });
        });

    Usuario.findOne({ email: googleUser.email }, (error, usuarioDB) => {

        if (error) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: error
            });
        }

        if (usuarioDB) {

            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    message: 'Debe usar su autenticación normal',
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

                return res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }
        } else {
            //El usuario no existe... hay que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.name;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((error, usuarioDB) => {

                if (error) {
                    return res.status(500).json({
                        ok: true,
                        mensaje: 'Error al crear usuario - google',
                        errors: error
                    });
                }


                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });

            });
        }


    });

});


/**
 * ==================================
 * Autenticación normal
 * ==================================
 */
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