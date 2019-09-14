# 05 Notas + Auth
Utilizando la autenticación anterior:

## Models nota
```js
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const notaSchema = new Schema({
  nombre:   { type: String, required: [true, 'El nombre es necesario'] },
  descripcion: String,
  usuarioId: String,
  date: { type: Date, default: Date.now },
  activo: Boolean
});

// Convertir a modelo
const Nota = mongoose.model('Nota', notaSchema);

export default Nota;
```

## Ruta nota
```js
var express = require('express');
var router = express.Router();

// Importamos modelos
import User from '../models/user';
import Nota from '../models/nota';

// Middlewares
const {verificaToken, verificaRol} = require('../middlewares/autenticacion');

//RUTAS
router.post('/nueva', verificaToken,  async(req, res) => {

  let body = req.body;
  console.log(req.usuario);
  body.usuarioId = req.usuario._id;

  try {
    const tareaDB = await Nota.create(body);
    return res.json(tareaDB);
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Error al crear nota',
      error
    })
  }

});

router.get('/', verificaToken, async(req, res) => {

  let usuarioId = req.usuario._id;

  try {

    const tareaDB = await Nota.find({usuarioId});
    return res.json(tareaDB)
    
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Error al crear nota',
      error
    })
  }

});


module.exports = router;
```

## App.js
```js
app.use('/nota', require('./routes/nota'));
```

## Vue.js
