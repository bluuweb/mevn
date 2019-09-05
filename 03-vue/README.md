# Front-End con Vue.js
Vamos a realizar la configuración de Vue.js, si no sabes nada de Vue puedes [acceder al curso aquí](http://bit.ly/2WtBh9f)

## Intalación Vue UI
La configuración de un nuevo proyecto ya está explicado en el curso, por lo tanto en general ejecutar:
```
vue ui
```
Realizar la instalación de un nuevo proyecto utilizando Vue Router y Vuex

## Bootstrap
Una vez dentro de tu proyecto instalar [https://bootstrap-vue.js.org/docs/](https://bootstrap-vue.js.org/docs/):
```
npm install vue bootstrap-vue bootstrap
```
Abrir archivo `main.js`
```js
import BootstrapVue from 'bootstrap-vue'

Vue.use(BootstrapVue)

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
```

## Vue-axios
[https://www.npmjs.com/package/vue-axios](https://www.npmjs.com/package/vue-axios)
```
npm install --save axios vue-axios
```
```js
import axios from 'axios'
import VueAxios from 'vue-axios'
 
Vue.use(VueAxios, axios)

// Agregamos la URL base de nuestra API
axios.defaults.baseURL = 'http://localhost:3000/api';
```

## router.js
Configurar rutas: Agregaremos la siguiente ruta con una vista:
```js
{
  path: '/tareas',
  name: 'tareas',
  component: () => import(/* webpackChunkName: "about" */ './views/Tareas.vue')
}
```

## View GET
Agregar una vista llamada `Tareas.vue`, donde agregaremos un nuestro listado de tareas:
```html
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
    <tr v-for="(item, index) in tareas" :key="index">
      <th scope="row">{{item._id}}</th>
      <td>{{item.nombre}}</td>
      <td>{{item.descripcion}}</td>
      <td>{{item.date}}</td>
      <td>
        <b-button class="btn-warning btn-sm mx-2" @click="activarEdicion(item._id)">Actualizar</b-button>
        <b-button class="btn-danger btn-sm mx-2" @click="eliminarTarea(item._id)">Eliminar</b-button>
      </td>
    </tr>
  </tbody>
</table>
```
```js
export default {
  data() {
    return {
      tareas: [],
    };
  },
  created(){
    this.listarTareas();
  },
  methods:{
    listarTareas(){
      this.axios.get('tareas')
      .then((response) => {
        // console.log(response.data)
        this.tareas = response.data;
      })
      .catch((e)=>{
        console.log('error' + e);
      })
    }
  }
};
```

## Alertas Bootstrap
[https://bootstrap-vue.js.org/docs/components/alert#auto-dismissing-alerts](https://bootstrap-vue.js.org/docs/components/alert#auto-dismissing-alerts)
```html
<b-alert
  :show="dismissCountDown"
  dismissible
  :variant="mensaje.color"
  @dismissed="dismissCountDown=0"
  @dismiss-count-down="countDownChanged"
>
  {{mensaje.texto}}
</b-alert>
```
```js
data() {
    return {
      mensaje: {color: 'success', texto: ''},
      dismissSecs: 5,
      dismissCountDown: 0
    };
  },
  methods:{
    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown
    },
    showAlert() {
      this.dismissCountDown = this.dismissSecs
    }
  }
```

## View POST
```html
<form @submit.prevent="agregarTarea(tarea)" v-if="agregar">
  <h3 class="text-center">Agregar nueva Tarea</h3>
  <input type="text" placeholder="Ingrese un Nombre" class="form-control my-2" v-model="tarea.nombre">
  <input type="text" placeholder="Ingrese una descripcion" class="form-control my-2" v-model="tarea.descripcion">
  <b-button class="btn-sm btn-block btn-success" type="submit">Agregar</b-button>
</form>
```
```js
export default {
  data() {
    return {
      tareas: [],
      tarea: {},
      agregar: true,
    };
  },
  methods:{
    agregarTarea(item){
      this.axios.post('nueva-tarea', item)
        .then(res => {
          // Agrega al inicio de nuestro array Tareas
          this.tareas.unshift(res.data);

          // Alerta de mensaje
          this.showAlert();
          this.mensaje.texto = 'Tarea Agregada!'
          this.mensaje.color = 'success';
        })
        .catch( e => {
          console.log(e.response.data.error.errors.nombre.message);

          // Alerta de mensaje
          this.showAlert();
          this.mensaje.color = 'danger';
          this.mensaje.texto = e.response.data.error.errors.nombre.message;
        })
      this.tarea = {}
    },
  }
};
```

## View DELETE
```html
<!-- Dentro del ciclo for (Tabla) -->
<b-button class="btn-danger btn-sm mx-2" @click="eliminarTarea(item._id)">Eliminar</b-button>
```
```js
eliminarTarea(id){
  this.axios.delete(`tarea/${id}`)
    .then(res => {
      let index = this.tareas.findIndex( item => item._id === res.data._id )
      this.tareas.splice(index, 1);

      this.showAlert();
      this.mensaje.texto = 'Tarea Eliminada!'
      this.mensaje.color = 'danger'
    })
    .catch( e => {
      console.log(e.response);
    })
},
```

## View PUT
```html
<form @submit.prevent="editarTarea(tareaEditar)" v-else>
  <h3 class="text-center">Editar Tarea</h3>
  <input type="text" placeholder="Ingrese un Nombre" class="form-control my-2" v-model="tareaEditar.nombre">
  <input type="text" placeholder="Ingrese una descripcion" 
  class="form-control my-2" v-model="tareaEditar.descripcion">
  <b-button class="btn-sm btn-block mb-1 btn-warning" type="submit">Editar</b-button>
  <b-button class="btn-sm btn-block" @click="agregar = true">Cancelar</b-button>
</form>

<!-- Dentro del ciclo for (Tabla) -->
<b-button class="btn-warning btn-sm mx-2" @click="activarEdicion(item._id)">Actualizar</b-button>
```

```js
data() {
  return {
    agregar: true,
    tareaEditar: {},
  };
},
method:{
  activarEdicion(id){
    this.agregar = false;
    this.axios.get(`buscar/?_id=${id}`)
      .then(res => {
        this.tareaEditar = res.data;
      })
      .catch(e => {
        console.log(e.response);
      })
  },
  editarTarea(item){
    this.axios.put(`tarea/${item._id}`, item)
      .then(res => {
        let index = this.tareas.findIndex( itemTarea => itemTarea._id === this.tareaEditar._id);
        this.tareas[index].nombre = this.tareaEditar.nombre;
        this.tareas[index].descripcion = this.tareaEditar.descripcion;
        this.tareaEditar = {}

        this.showAlert();
        this.mensaje.texto = 'Tarea Actualizada'
        this.mensaje.color = 'success'
      })
      .catch(e => {
        console.log(e);
      })
    this.agregar = true;
  },
}
```