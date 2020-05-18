var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;


// Verificar token
// -----------------
// De este punto para abajo se va a solicitar esta verificacion
exports.verificaToken = function(req, res, next) {

  var token = req.query.token;

  jwt.verify( token, SEED, (err, decoded) => {

    if ( err ){
      return res.status(401).json({
          ok: false,
          mensaje: 'Token incorrecto',
          errors: err
      });
    }

    req.usuario = decoded.usuario;

    next(); // indica que puede continuar con las siguientes funciones


// Solamente muestra que viene en el decoded
      // res.status(200).json({
      //     ok: true,
      //     decoded: decoded
      // });

    });

  }
