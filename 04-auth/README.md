# 04 Autenticación
Ahora realizaremos la autenticación de usuarios:

<!-- ## Generador de aplicaciones Express
[https://expressjs.com/es/starter/generator.html](https://expressjs.com/es/starter/generator.html)
Utilice la herramienta de generador de aplicaciones, express, para crear rápidamente un esqueleto de aplicación.

Instale express con el siguiente mandato:
```
npm install express-generator -g
```

## Crear plantilla
```
express --no-view --git myapp
```

```
cd myapp
npm install
```

## Instalar
Tenemos que instalar Babel, Nodemon, Mongoose, History Vue.js y configurar nuestro script:
```json
"scripts": {
  "dev": "node ./bin/www",
  "devbabel": "nodemon ./bin/www --exec babel-node"
},
```

## Configurar DB
Agregar en `app.js`
```js
const mongoose = require('mongoose');

const uri = 'mongodb://localhost:27017/v1-auth';
const options = {useNewUrlParser: true, useCreateIndex: true};
// Or using promises
mongoose.connect(uri, options).then(
  /** ready to use. The `mongoose.connect()` promise resolves to mongoose instance. */
  () => { console.log('Conectado a DB') },
  /** handle initial connection error */
  err => { console.log(err) }
);
```

## mongoose-unique-validator
Para hacer un campo único que no se repita en la base de datos tenemos [mongoose-unique-validator](https://www.npmjs.com/package/mongoose-unique-validator)
```
npm i mongoose-unique-validator --save
``` -->

## Models
Crearemos nuestro modelo utilizando campos únicos, en la carpeta `models` crea un archivo `user.js`
```js{3,5-9,15,18,22-23}
import mongoose from 'mongoose';

const uniqueValidator = require('mongoose-unique-validator');

// Roles
const roles = {
  values: ['ADMIN', 'USER'],
  message: '{VALUE} no es un rol válido'
}

const Schema = mongoose.Schema;

const userSchema = new Schema({
  nombre:   { type: String, required: [true, 'El nombre es necesario'] },
  email: { type: String, unique: true, required: [true, 'Email es necesario'] },
  pass: { type: String, required: [true, 'Pass es necesario'] },
  date: { type: Date, default: Date.now },
  role: { type: String, default: 'USER', enum: roles },
  activo: { type: Boolean, default: true }
});

// Validator
userSchema.plugin(uniqueValidator, { message: 'Error, esperaba {PATH} único.' });

// Convertir a modelo
const User = mongoose.model('User', userSchema);

export default User;
```

## bcrypt
Vamos a encriptar la contraseña [https://www.npmjs.com/package/bcrypt](https://www.npmjs.com/package/bcrypt)
```
npm i bcrypt --save
```

En nuestra ruta `users.js`
```js
var express = require('express');
var router = express.Router();

// Importamos modelo Tarea
import User from '../models/user';

// Hash Contraseña
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.post('/nuevo-usuario', async (req, res) => {

  const body = {
    nombre: req.body.nombre,
    email: req.body.email,
    role: req.body.role
  }

  body.pass = bcrypt.hashSync(req.body.pass, saltRounds);

  try {

    const userDB = await User.create(body);

    return res.json(userDB);
    
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Ocurrio un error',
      error
    });
  }

});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
```

## Eliminar pass JSON
En nuestro Squema agregar: [info](https://medium.com/@contactsunny/hide-properties-of-mongoose-objects-in-node-js-json-responses-a5437a5dbec2)
```js
// Eliminar pass de respuesta JSON
userSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj.pass;
  return obj;
 }
```

## PUT usuario
```js
router.put('/usuario/:id', async(req, res) => {

  let id = req.params.id;
  let body = req.body;

  try {
    // {new:true} nos devuelve el usuario actualizado
    const usuarioDB = await User.findByIdAndUpdate(id, body, {new: true});

    return res.json(usuarioDB);

  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }

});
```

## runValidators: true
Agregaremos otra opción a nuestra actualización para que corra las validaciones (para que no se puedan ingresar roles inválidos)
```js
const usuarioDB = await User.findByIdAndUpdate(id, body, {new: true, runValidators: true});
```

## Underscore
[https://underscorejs.org/](https://underscorejs.org/) nos permitirá agregar validaciones

Instalación:
```
npm install underscore --save
```
Agregar a la ruta:
```js
// Filtrar campos de PUT
const _ = require('underscore');
```
Utilizar para filtrar
```js
router.put('/usuario/:id', async(req, res) => {

  let id = req.params.id;
  let body = _.pick(req.body, ['nombre', 'email', 'role', 'pass']);
  if(body.pass){
    body.pass = bcrypt.hashSync(req.body.pass, saltRounds);
  }

  try {
    // {new:true} nos devuelve el usuario actualizado
    const usuarioDB = await User.findByIdAndUpdate(id, body, {new: true, runValidators: true});

    return res.json(usuarioDB);

  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }

});
```

## GET usuario paginados
Vamos a crear un get para traer x cantidad de usuario de nuestra base de datos:
```js
router.get('/usuario', async(req, res) => {

  // Leemos las query y pasamos a números
  let inicio = Number(req.query.inicio) || 0;
  let limite = Number(req.query.limite) || 5;

  try {

    const usuariosDB = await User.find().skip(inicio).limit(limite);
    const cantidadUsuarios = await User.countDocuments();
    return res.json({usuariosDB, cantidadUsuarios});
    
  } catch (error) {
    return res.status(500).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }

});
```

## DELETE Usuario
```js
router.delete('/usuario/:id', async(req, res) => {

  let id = req.params.id;

  try {

    const usuarioDelete = await User.findByIdAndRemove(id);

    if(!usuarioDelete){
      return res.status(400).json({
        mensaje: 'Usuario no encontrado'
      })
    }

    return res.json(usuarioDelete);
    
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }

});
```

## Ruta Login
Crear una nueva ruta: `login.js`
```js
const express = require('express');
const router = express.Router();
import User from '../models/user';
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.get('/', async(req, res) => {
  res.json({mensaje: 'Funciona!'})
})

module.exports = router;
```
Configurar `app.js`
```js
// Usamos las rutas
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', require('./routes/login'));
```

## POST login
```js
router.post('/', async(req, res) => {

  let body = req.body;

  try {
    // Buscamos email en DB
    const usuarioDB = await User.findOne({email: body.email});

    // Evaluamos si existe el usuario en DB
    if(!usuarioDB){
      return res.status(400).json({
        mensaje: 'Usuario! o contraseña inválidos',
      });
    }

    // Evaluamos la contraseña correcta
    if( !bcrypt.compareSync(body.pass, usuarioDB.pass) ){
      return res.status(400).json({
        mensaje: 'Usuario o contraseña! inválidos',
      });
    }

    // Pasó las validaciones
    return res.json({
      usuarioDB,
      token: 'fkajsdkf'
    })
    
  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    });
  }

});
```

## JWT
[https://jwt.io/](https://jwt.io/)

Instalación [https://www.npmjs.com/package/jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
```
npm i jsonwebtoken --save
```

Importamos la librería:
```js
// JWT
const jwt = require('jsonwebtoken');
```

Utilizamos JWT
```js
// Evaluamos la contraseña correcta
if( !bcrypt.compareSync(body.pass, usuarioDB.pass) ){
  return res.status(400).json({
    mensaje: 'Usuario o contraseña! inválidos',
  });
}

// Generar Token
let token = jwt.sign({
  data: usuarioDB
}, 'secret', { expiresIn: 60 * 60 * 24 * 30}) // Expira en 30 días

// Pasó las validaciones
return res.json({
  usuarioDB,
  token: token
})
```

## Middlewares
Crear carpeta en la raíz de nuestro proyecto llamada `middlewares` y dentro un archivo llamado: `autenticacion.js`
```js
const verificarAuth = (req, res, next) => {

  // Leer headers
  let token = req.get('token');

  console.log(token);

  next();

}

module.exports = {verificarAuth};
```

Ahora en la ruta de `user.js` llamamos al middleware para ver si está funcionando...
```js
const {verificarAuth} = require('../middlewares/autenticacion.js');

router.get('/usuario', verificarAuth , async(req, res) => {
```

## Verificar Token
Vamos a verificar un token válido, en `autenticacion.js` (Al enviar la petición get a través de Postman envíar en los header un token válido de login);
```js
const jwt = require('jsonwebtoken');

let verificarAuth = (req, res, next) => {

  // Leer headers
  let token = req.get('token');

  jwt.verify(token, 'secret', (err, decoded) => {

    if(err) {
      return res.status(401).json({
        mensaje: 'Error de token',
        err
      })
    }

    // Creamos una nueva propiedad con la info del usuario
    req.usuario = decoded.data; //data viene al generar el token en login.js
    next();

  });

}

module.exports = {verificarAuth};
```

Ahora aplicar a todas la peticiones de user.

## Verificar rol ADMIN
```js
let verificaRol = (req, res, next) => {

  let rol = req.usuario.role;

  console.log(rol);
  
  if(rol !== 'ADMIN'){
    return res.status(401).json({
      mensaje: 'Rol no autorizado!'
    })
  }
  
  next();

}

module.exports = {verificarAuth, verificaRol};
```

Utilizar en POST, PUT, DELETE
```js
// Middlewares
const {verificarAuth, verificaRol} = require('../middlewares/autenticacion');

router.post('/nuevo-usuario', [verificarAuth, verificaRol], async (req, res) => {

router.put('/usuario/:id', [verificarAuth, verificaRol], async(req, res) => {

router.delete('/usuario/:id', [verificarAuth, verificaRol], async(req, res) => {
```










