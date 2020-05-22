var express = require('express');
var fileUpload = require('express-fileupload')
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.use( fileUpload({ useTempFiles: true }) );

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de colección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if ( tiposValidos.indexOf( tipo ) < 0 ) {
      return res.status(400).json({
          ok: false,
          mensaje: 'Tipo de colección no válido',
          errors: { message: 'El tipo de colección no es válido' }
      });
    }


    if(!req.files){
      return res.status(400).json({
          ok: false,
          mensaje: 'No se seleccionó ningún archivo',
          errors: { message: 'Debe seleccionar una imagen' }
      });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.'); //corta a partir del ultimo punto
    var extensionArchivo = nombreCortado[nombreCortado.length-1];

    // Extensiones aceptadas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if ( extensionesValidas.indexOf( extensionArchivo ) < 0 ) {
      return res.status(400).json({
          ok: false,
          mensaje: 'Extensión no válida',
          errors: { message: 'Las extensionas validas son ' + extensionesValidas.join(', ') }
      });
    }

    // Se renombra el archivo subido para evitar colisiones de nombre
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv( path, err => {

        if( err ) {
          return res.status(500).json({
              ok: false,
              mensaje: 'Error al mover el archivo',
              errors: err
          });
        }

        subirPorTipo( tipo, id, nombreArchivo, res );

        // res.status(200).json({
        //   ok: true,
        //   mensaje: 'Archivo movido con éxito',
        //   extensionArchivo
        // });

    });

});


function subirPorTipo( tipo, id, nombreArchivo, res ) {

    if ( tipo === 'usuarios' ) {

        Usuario.findById(id, (err, usuario) =>{

            if( !usuario ){
                return res.status(400).json({
                  ok: false,
                  mensaje: 'Usuario no existe',
                  errors: { message: 'Usuario no existe' }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save( (err, usuarioActualizado) =>{

                usuarioActualizado.password = 'passEncrypted';

                return res.status(200).json({
                  ok: true,
                  mensaje: 'Imagen de usuario actualizada',
                  usuario: usuarioActualizado

                });
            });

        });

    }

    if ( tipo === 'medicos' ) {

        Medico.findById(id, (err, medico) =>{

            if ( !medico ) {
              return res.status(400).json({
                ok: false,
                mensaje: 'Médico no existe',
                errors: { message: 'Médico no existe'}
              });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            if ( fs.existsSync(pathViejo)) {
                 fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save( (err, medicoActualizado) =>{

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de médico actualizada',
                    medico: medicoActualizado
                });
            });

        });

    }

    if ( tipo === 'hospitales' ) {

      Hospital.findById(id, (err, hospital) =>{

        if( !hospital ){
            return res.status(400).json({
              ok: false,
              mensaje: 'Hospital no existe',
              errors: { message: 'Hospital no existe' }
            });
        }


          var pathViejo = './uploads/hospitales/' + hospital.img;

          if ( fs.existsSync(pathViejo)) {
               fs.unlinkSync(pathViejo);
          }

          hospital.img = nombreArchivo;

          hospital.save( (err, hospitalActualizado) =>{

              return res.status(200).json({
                  ok: true,
                  mensaje: 'Imagen de médico actualizada',
                  hospital: hospitalActualizado
              });
          });

      });

    }

}

module.exports = app;
