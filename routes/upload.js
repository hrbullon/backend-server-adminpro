var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

// default options
app.use(fileUpload());

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;
    var tiposValidos = ['medicos', 'hospitales', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Tipo de colección no válido',
            errors: { message: "Tipo de colección no válido" }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No ha seleccionado nada',
            errors: { message: "Debe de seleccionar una imagen" }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No ha seleccionado nada',
            errors: { message: "Debe de seleccionar una imagen" }
        });
    }

    //Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensioArchivo = nombreCortado[nombreCortado.length - 1];

    //Validar extensiones del archivo
    var extensionesValidas = ['png', 'gif', 'jpg', 'jpeg'];

    if (extensionesValidas.indexOf(extensioArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Extensión no válida',
            errors: { message: "Las extensiones válidas son: " + extensionesValidas.join(", ") }
        });
    }

    //Renombrar archivo
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds()}.${ extensioArchivo }`;

    //Path 
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    //Mover archivo
    archivo.mv(path, (error) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                message: "Error al mover archivo",
                error: error
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    });

});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo == "usuarios") {
        Usuario.findById(id, (error, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    message: 'Usuario no existe',
                    errors: { message: "Usuario no existe" }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            //Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;
            usuario.save((error, usuarioActualizado) => {
                return res.status(200).json({
                    ok: true,
                    message: "Imagen de usuario actualizada",
                    usuario: usuarioActualizado
                });
            });
        });
    }

    if (tipo == "medicos") {
        Medico.findById(id, (error, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    message: 'Médico no existe',
                    errors: { message: "Médico no existe" }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            //Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;
            medico.save((error, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    message: "Imagen de médico actualizada",
                    medico: medicoActualizado
                });
            });
        });
    }

    if (tipo == "hospitales") {
        Hospital.findById(id, (error, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    message: 'Hospital no existe',
                    errors: { message: "Hospital no existe" }
                });
            }
            var pathViejo = './uploads/hospitales/' + hospital.img;

            //Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;
            hospital.save((error, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    message: "Imagen de hospital actualizada",
                    hospital: hospitalActualizado
                });
            });
        });
    }

}

module.exports = app;