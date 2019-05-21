var express = require('express');
var mdAuthentication = require('../middlewares/authentication');

var app = express();

var Hospital = require('../models/hospital');

/**==============================
 * Get all hospitals
 *===============================*/
app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((error, hospitales) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error cargando hospitales',
                    errors: error
                });
            }

            Hospital.count({}, (error, conteo) => {
                return res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });
            })
        });
});


/**==============================
 * Update hospital
 *===============================*/
app.put('/:id', mdAuthentication.verifyToken, (req, res, next) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (error, hospital) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                message: 'Error a buscar hospital',
                errors: error
            });
        }

        if (!hospital) {
            return res.status(500).json({
                ok: false,
                message: 'El hospital con el id: ' + i + ' no existe',
                errors: error
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((error, hospitalSave) => {
            if (error) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar el hospital',
                    errors: error
                });
            }

            return res.status(200).json({
                ok: true,
                hospital: hospitalSave
            });
        });
    });

});

/**==============================
 * Create hospital
 *===============================*/
app.post('/', mdAuthentication.verifyToken, (req, res, next) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((error, hospitalSaved) => {
        if (error) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear hospital',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        return res.status(201).json({
            ok: true,
            hospital: hospitalSaved
        });
    });
});


/**==============================
 * Delete medico
 *===============================*/
app.delete('/:id', mdAuthentication.verifyToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (error, hospitalRemoved) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                message: 'Error a borrar hospital',
                errors: error
            });
        }

        if (!hospitalRemoved) {
            return res.status(400).json({
                ok: false,
                message: 'No existe un hospital con ese ID',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        return res.status(200).json({
            ok: true,
            hospital: hospitalRemoved
        });
    });
});

module.exports = app;