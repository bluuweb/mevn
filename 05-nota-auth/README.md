# 05 Notas + Auth + Vue.js

Utilizando la autenticación anterior:

## Models nota

```js
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const notaSchema = new Schema({
  nombre: { type: String, required: [true, "El nombre es necesario"] },
  descripcion: String,
  usuarioId: String,
  date: { type: Date, default: Date.now },
  activo: Boolean
});

// Convertir a modelo
const Nota = mongoose.model("Nota", notaSchema);

export default Nota;
```

## Ruta nota

```js
var express = require("express");
var router = express.Router();

// Importamos modelos
import User from "../models/user";
import Nota from "../models/nota";

// Middlewares
const { verificaToken, verificaRol } = require("../middlewares/autenticacion");

//RUTAS
router.post("/nueva", verificaToken, async (req, res) => {
  let body = req.body;
  console.log(req.usuario);
  body.usuarioId = req.usuario._id;

  try {
    const tareaDB = await Nota.create(body);
    return res.json(tareaDB);
  } catch (error) {
    return res.status(400).json({
      mensaje: "Error al crear nota",
      error
    });
  }
});

router.get("/", verificaToken, async (req, res) => {
  let usuarioId = req.usuario._id;

  try {
    const tareaDB = await Nota.find({ usuarioId });
    return res.json(tareaDB);
  } catch (error) {
    return res.status(400).json({
      mensaje: "Error al crear nota",
      error
    });
  }
});

module.exports = router;
```

## App.js

```js
app.use("/nota", require("./routes/nota"));
```

## Vue.js

Basados en un proyecto con Vue + VueRouter + Vuex

## Agregar Vista Login

```html
<template>
  <div class="container">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <input
        type="text"
        class="form-control my-2"
        placeholder="email"
        v-model="usuario.email"
      />
      <input
        type="text"
        class="form-control my-2"
        placeholder="pass"
        v-model="usuario.pass"
      />
      <b-button type="submit">Acceder</b-button>
    </form>
    <div v-if="mensaje !== ''">
      <p>{{mensaje}}</p>
    </div>
  </div>
</template>
```

```js
import { mapState, mapMutations, mapActions } from "vuex";
import router from '../router';

export default {
  data() {
    return {
      usuario: {email: 'prueba1@bluuweb.cl', pass: '123123'},
      mensaje: ''
    }
  },
  methods:{
    ...mapMutations(['obtenerUsuario']),
    ...mapActions(['guardarUsuario', 'leerToken', 'cerrarSesion']),
    login(){
      this.axios.post('/login', this.usuario)
        .then(res => {
          // console.log(res.data.token);
          const token = res.data.token;
          // this.usuarioDB = res.data.usuarioDB
          this.guardarUsuario(token);
        })
        .catch(err => {
          console.log(err.response.data.mensaje);
          this.mensaje = err.response.data.mensaje;
        })
    }
  }
}
```
## store.js
Vamos a instalar [jwt-decode](https://www.npmjs.com/package/jwt-decode), [Documentación](https://github.com/auth0/jwt-decode)
```
npm i jwt-decode --save
```

```js
import Vue from 'vue'
import Vuex from 'vuex'

import router from './router'

// para decodificar el jwt
import decode from 'jwt-decode'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: '',
    usuarioDB: ''
  },
  mutations: {
    obtenerUsuario(state, payload){
      state.token = payload;
      if(payload === ''){
        state.usuarioDB = ''
      }else{
        state.usuarioDB = decode(payload);
        router.push({name: 'notas'})
      }
    }
  },
  actions: {

    guardarUsuario({commit}, payload){
      localStorage.setItem('token', payload);
      commit('obtenerUsuario', payload)
    },
    cerrarSesion({commit}){
      commit('obtenerUsuario', '');
      localStorage.removeItem('token');
      router.push({name: 'login'});
    },
    leerToken({commit}){

      const token = localStorage.getItem('token');
      if(token){
        commit('obtenerUsuario', token);
      }else{
        commit('obtenerUsuario', '');
      }

    }

  },
  getters:{
    estaActivo: state => !!state.token
  }
})

```

## router.js
```js
import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

// Importamos la tienda
import store from './store.js';

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: () => import(/* webpackChunkName: "about" */ './views/Login.vue')
    },
    {
      path: '/nota',
      name: 'nota',
      component: () => import(/* webpackChunkName: "nota" */ './views/Nota.vue'),
      meta: {requireAuth: true}
    }
  ]
});

router.beforeEach((to, from, next) => {
  const rutaProtegida = to.matched.some(record => record.meta.requireAuth);

  if(rutaProtegida && store.state.token === ''){
    // console.log(store.state.token);
    next({name: 'login'})

  }else{
    next()
  }

})

export default router;
```

## nota.vue
```html
<template>
  <div class="container">
    <h1>Ruta privada!</h1>
    <table class="table">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Nombre</th>
          <th scope="col">Descripción</th>
          <th scope="col">Fecha</th>
          <th scope="col">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in notas" :key="index">
          <th scope="row">{{item._id}}</th>
          <td>{{item.nombre}}</td>
          <td>{{item.descripcion}}</td>
          <td>{{item.date}}</td>
          <td>
            <!-- <b-button class="btn-warning btn-sm mx-2" @click="activarEdicion(item._id)">Actualizar</b-button> -->
            <!-- <b-button class="btn-danger btn-sm mx-2" @click="eliminarTarea(item._id)">Eliminar</b-button> -->
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

```js
import { mapState, mapActions } from "vuex";
export default {
  data() {
    return {
      notas: []
    };
  },
  computed: {
    ...mapState(["token"])
  },
  methods: {
    listarNotas(){
      let config = {
        headers: {
          token: this.token
        }
      }

      this.axios.get('/nota', config)
        .then(res => {
          console.log(res.data);
          this.notas = res.data;
        })
        .catch(e => {
          console.log(e.response);
        })
    },
    agregarNota(){
      let config = {
        headers: {
          token: this.token
        }
      }
      // console.log(this.nota);
      this.axios.post('/nueva-nota', this.nota, config)
        .then(res => {
          this.notas.push(res.data)
          this.nota.nombre = '';
          this.nota.descripcion = '';
          this.mensaje.color = 'success';
          this.mensaje.texto = 'Nota Agregada!';
          this.showAlert()
        })
        .catch(e => {
          console.log(e.response);
          if(e.response.data.error.errors.nombre.message){
            this.mensaje.texto = e.response.data.error.errors.nombre.message
          }else{
            this.mensaje.texto = 'Error de sistema';
          }
          this.mensaje.color = 'danger';
          this.showAlert()
        })
    },
  },
  created() {
    this.getTareas();
  }
}
```

## app.vue
```html
<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/login" v-if="!estaActivo">login</router-link> |
      <router-link to="/nota" v-if="estaActivo">nota</router-link> |
      <button @click="cerrarSesion()" v-if="estaActivo">Cerrar Sesión</button>
    </div>
    <router-view/>
  </div>
</template>
```

```js
import { mapActions, mapGetters } from "vuex";
export default {
  methods:{
    ...mapActions(['cerrarSesion', 'leerToken'])
  },
  computed:{
    ...mapGetters(['estaActivo'])
  },
  created(){
    this.leerToken();
  }
}
```

