# 02 Bases de Datos
Vamos a trabajar con [https://mongoosejs.com/](https://mongoosejs.com/)

## Instalación Mongoose
```
npm install mongoose --save
```
En nuestro `app.js` configurar [https://mongoosejs.com/docs/connections.html#callback](https://mongoosejs.com/docs/connections.html#callback)
```js
// Conexión base de datos
const mongoose = require('mongoose');

const uri = 'mongodb://localhost:27017/myapp';
const options = {useNewUrlParser: true, useCreateIndex: true};

// Or using promises
mongoose.connect(uri, options).then(
  /** ready to use. The `mongoose.connect()` promise resolves to mongoose instance. */
  () => { console.log('Conectado a DB') },
  /** handle initial connection error */
  err => { console.log(err) }
);
```

## Schemas
Un Schema nos sirve para estandarizar nuestros documentos en la collection de nuestra base de datos. Te invito a crear otra carpeta con el nombre `models` y dentro un archivo `nota.js` [https://mongoosejs.com/docs/guide.html](https://mongoosejs.com/docs/guide.html)
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

## Rutas (POST)
Vamos a interactuar con nuestras primeras rutas, para esto dentro de la raíz de tu proyecto crea la carpeta `routes` y luego un archivo `nota.js`

```js
//Importamos express
import express from 'express';
const app = express();

// Importamos modelo Nota
import Nota from '../models/nota';

// Agregamos una nueva nota
app.post('/nueva-nota', async (req, res)=>{

  let body = req.body;

  try {
    
    const notaDB = await Nota.create(body);
    res.status(200).json(notaDB);

  } catch (error) {
    
    return res.status(500).json({
      ok: false,
      mensaje: 'Ocurrio un error',
      error
    });
    
  }
  
});

// Exportamos la configuración de express app
module.exports = app;
```

Vamos a crear un archivo dentro de esta misma carpeta `routes` llamado `index.js` donde almacenaremos todas las configuraciones:
```js
import express from 'express';
const app = express();

app.use(require('./nota'));

module.exports = app;
```

Finalmente abrimos nuestro `app.js` y agregamos las rutas configuradas globalmente:
```js
// Rutas
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Configuración globarl de rutas
app.use('/api', require('./routes'));
```

## Postman
[https://www.getpostman.com/downloads/](https://www.getpostman.com/downloads/) Nos sirve para probar nuestra aplicación, pudiendo enviar peticiones POST, DELETE, GET y PUT según sea necesario.

Levantamos nuestro servidor:
```s
npm run devbabel
```

Configuramos a través de POST el llamado a:
```s
http://localhost:3000/nueva-nota
```

En Headers configuramos:
```s
Key: Content-Type 
Value: application/x-www-form-urlencoded
```

Y en body seleccionamos `x-www-form-urlencoded` y agregamos los campos necesarios para agregar una nueva categoria:
```s
nombre | Categoria
descripcion | Descripción Categoria
activo | true
```

Damos clic en Send y cruzamos los dedos para ver si todo funciona ok.
```json
{
    "_id": "5d6c830664b3a8144c5ad6f1",
    "nombre": "Categoria",
    "descripcion": "Descripción Categoria",
    "activo": true,
    "date": "2019-09-02T02:48:38.281Z",
    "__v": 0
}
```

## Rutas GET
```js
// Encontrar una nota
app.get('/buscar/', async (req, res) => {

  try {
    console.log(req.query._id);
    const registroDB = await Nota.findOne({_id: req.query._id});
    if(!registroDB){
      res.status(404).json({
        ok: false,
        mensaje: 'No existe la nota'
      });
    }else{
      res.status(200).json(registroDB);
    }
    
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: 'Ocurrio un error',
      error
    });
  }

});

// Mostrar todas las notas
app.get('/notas', async(req, res) => {

  try {
    let valor = req.query.valor;
    const registroDB = await Nota.find({
      'nombre': new RegExp(valor, 'i')
    }).sort({'date': -1})
    res.status(200).send(registroDB);
    
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: 'Ocurrio un error',
      error
    });
  }
});
```

## Rutas PUT
```js
// Actualizar nota
app.put('/nota/:id', async(req, res) => {

  try {
    
    const notaDB = await Nota.findByIdAndUpdate(
      {_id: req.params.id},
      {nombre: req.body.nombre, descripcion: req.body.descripcion, activo: req.body.activo},
      {useFindAndModify: false}
      );

      res.status(200).json(notaDB);

  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: 'Ocurrio un error',
      error
    });
  }
});
```

## Rutas DELETE
```js
// Eliminar Nota
app.delete('/nota/:id', async(req, res) => {


  try {
    const notaDB = await Nota.findByIdAndDelete({_id: req.params.id});

    if (!notaDB) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Usuario no encontrado'
        });
    }

    res.status(200).json(notaDB);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: 'Ocurrio un error',
      error
    });
  }

});
```

