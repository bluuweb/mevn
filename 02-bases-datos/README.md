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
Un Schema nos sirve para estandarizar nuestros documentos en la collection de nuestra base de datos. Te invito a crear otra carpeta con el nombre `models` y dentro un archivo `tarea.js` [https://mongoosejs.com/docs/guide.html](https://mongoosejs.com/docs/guide.html)
```js
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const tareaSchema = new Schema({
  nombre:   { type: String, required: [true, 'El nombre es necesario'] },
  descripcion: String,
  date: { type: Date, default: Date.now },
  activo: Boolean
});

// Convertir a modelo
const Tarea = mongoose.model('Tarea', tareaSchema);

export default Tarea;
```

## Rutas (POST)
Vamos a interactuar con nuestras primeras rutas, para esto dentro de la raíz de tu proyecto crea la carpeta `routes` y luego un archivo `tarea.js`

```js
//Importamos express
import express from 'express';
const app = express();

// Importamos modelo Tarea
import Tarea from '../models/tarea';

// Agregamos una nueva tarea
app.post('/nueva-tarea', async (req, res, next)=>{

  let body = req.body;

  try {
    
    const tareaDB = await Tarea.create(body);
    res.status(200).json(tareaDB);

  } catch (error) {
    
    return res.status(500).json({
      ok: false,
      mensaje: 'Ocurrio un error',
      error
    });
    
  }
  next();
  
});

// Exportamos la configuración de express app
module.exports = app;
```

Vamos a crear un archivo dentro de esta misma carpeta `routes` llamado `index.js` donde almacenaremos todas las configuraciones:
```js
import express from 'express';
const app = express();

app.use(require('./tarea'));

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
http://localhost:3000/nueva-tarea
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
// Encontrar una tarea
app.get('/buscar/', async (req, res, next) => {

  try {
    console.log(req.query._id);
    const registroDB = await Tarea.findOne({_id: req.query._id});
    if(!registroDB){
      res.status(404).json({
        ok: false,
        mensaje: 'No existe la tarea'
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
  next();

});

// Mostrar todas las tareas
app.get('/tareas', async(req, res, next) => {

  try {
    let valor = req.query.valor;
    const registroDB = await Tarea.find({
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

  next();
});
```

## Rutas PUT
```js
// Actualizar tarea
app.put('/tarea/:id', async(req, res, next) => {

  try {
    
    const tareaDB = await Tarea.findByIdAndUpdate(
      {_id: req.params.id},
      {nombre: req.body.nombre, descripcion: req.body.descripcion, activo: req.body.activo},
      {useFindAndModify: false}
      );

      res.status(200).json(tareaDB);

  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: 'Ocurrio un error',
      error
    });
  }

  next();
});
```

## Rutas DELETE
```js
// Eliminar Tarea
// Eliminar Tarea
app.delete('/tarea/:id', async(req, res, next) => {


  try {
    const tareaDB = await Tarea.findByIdAndDelete({_id: req.params.id});

    if (!tareaDB) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Usuario no encontrado'
        });
    }

    res.status(200).json(tareaDB);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      mensaje: 'Ocurrio un error',
      error
    });
  }

  next();

});
```

