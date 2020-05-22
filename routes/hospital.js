var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');


app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    dedse = Number(desde);

    Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .exec(
    (err, hospitales) => {

    if ( err ) {
      return res.status(500).json({
          ok: false,
          mensaje: 'Error al cargar el hospital',
          errors: err
      });
    }

    Hospital.count({}, (err, conteo) =>{
      res.status(200).json({
            ok: true,
            hospitales,
            total: conteo
      });
    });


  });
});

app.put('/:id', mdAutenticacion.verificaToken, (req, res) =>{

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if ( err ) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al actualizar el hospital',
            errors: err
          });
        }

        if ( !hospital ) {
          return res.status(400).json({
            ok: false,
            mensaje: 'El hospital con ese ' + id + 'no existe',
            errors: { message: 'No existe un hospital con ese id'}
          });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save( (err, hospitalGuardado) => {

            if ( err ) {
              return res.status(400).json({
                ok: false,
                mensaje: 'Error al actualizar el hospital',
                errors: err
              });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });

    });

});

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save( (err, hospitalGuardado) => {

        if ( err ) {
          return res.status(400).json({
            ok: false,
            mensaje: 'Error al crear el hospital',
            errors:err
          });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });

    });

});


app.delete('/:id', mdAutenticacion.verificaToken , ( req, res ) =>{

      var id = req.params.id;

      Hospital.findByIdAndRemove(id, (err, hospitalBorrado) =>{

        if ( err ) {
          return res.status(500).json({
            ok: false,
            message: 'Error al borrar hospital',
            errors: err
          });
        }

        if ( !hospitalBorrado ) {
          return res.status(400).json({
            ok: false,
            mensaje: 'No existe un hospital con ese id',
            errors: err
          });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

      });

});

module.exports = app;
