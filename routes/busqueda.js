var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

/*=================================
 *   Busqueda específica
 **================================*/
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var coleccion = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regEx = new RegExp(busqueda, 'i');
    var promesa;

    switch (coleccion) {
        case 'medicos':
            promesa = buscarMedicos(busqueda, regEx);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regEx);
            break;
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regEx);
            break;
        default:
            return res.status(400).json({
                ok: false,
                message: 'Los tipos de busqueda solo son: usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/colección no válido' }
            });
            break;
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [coleccion]: data
        });
    });

});

/*=================================
 *   Busqueda general
 **================================*/
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regEx = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(busqueda, regEx),
        buscarMedicos(busqueda, regEx),
        buscarUsuarios(busqueda, regEx)
    ]).then(respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2],
        });
    });
});

function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((error, hospitales) => {

                if (error) {
                    reject('Error al cargar los hospitales', error);
                } else {
                    resolve(hospitales)
                }

            });
    });
}


function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((error, medicos) => {

                if (error) {
                    reject('Error al cargar los medicos', error);
                } else {
                    resolve(medicos)
                }

            });
    });
}



function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((error, usuarios) => {

                if (error) {
                    reject('Error al cargar los usuarios', error);
                } else {
                    resolve(usuarios)
                }

            });
    });
}



module.exports = app;