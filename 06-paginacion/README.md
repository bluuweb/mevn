# 06 Paginación Mongoose y Vue.js
Veamos como paginar nuestras notas utilizando Node, MongoDB y Mongoose, Vue y Bootstrap 4.

## GET con paginación
```js
router.get('/nota', verificarAuth, async(req, res) => {
  const usuarioId = req.usuario._id

  const queryLimit = Number(req.query.limit) || 5;
  const querySkip = Number(req.query.skip) || 0;

  try {
    
    const notaDB = await Nota.find({usuarioId}).skip(querySkip).limit(queryLimit);

    // contar notas
    const totalNotas = await Nota.find({usuarioId}).countDocuments();

    res.json({notaDB, totalNotas});

  } catch (error) {
    return res.status(400).json({
      mensaje: 'Ocurrio un error',
      error
    })
  }

});
```

## Modificar Store.js
```js{2,12}
state: {
    token: localStorage.getItem('token') || '',
    usuarioDB: ''
  },
mutations: {
  obtenerUsuario(state, payload){
    state.token = payload;
    if(payload === ''){
      state.usuarioDB = ''
    }else{
      state.usuarioDB = decode(payload);
      // router.push({name: 'notas'})
    }
  }
},
```

## Modificar login.vue
```js{7}
login(){
  this.axios.post('/login', this.usuario)
    .then(res => {
      console.log(res.data);
      const token = res.data.token;
      this.guardarUsuario(token);
      this.$router.push({name: 'notas'});
    })
    .catch(e => {
      console.log(e.response);
      this.mensaje = e.response.data.mensaje
    })
}
```

## Notas.vue data()
```js
data() {
    return {
    totalNotas: 0,
    limite: 5,
    paginaActual: 1,
    ...
```

## Agregar Methods paginacion()
```js
paginacion(pagina) {
  let config = {
    headers: {
      token: this.token
    }
  };
  let skip = (pagina - 1) * this.limite;
  this.axios
    .get(`/nota?skip=${skip}&limit=${this.limite}`, config)
    .then(res => {
      console.log(res.data.notaDB);
      this.notas = res.data.notaDB;
      this.totalNotas = res.data.totalNotas;
    })
    .catch(e => {
      console.log(e.response);
    });
},
```

## watch
```js
watch: {
  "$route.query.pagina": {
    immediate: true,
    handler(pagina) {
      pagina = parseInt(pagina) || 1;
      console.log('pagina', pagina);
      this.paginacion(pagina);
      this.paginaActual = pagina
    }
  }
},
computed: {
  ...mapState(["token"]),
  cantidadPaginas() {
    return Math.ceil(this.totalNotas / this.limite);
  }
},
// created() {
//   this.listarNotas();
// },
```

## Paginación Bootstrap 4 y Vue.js
[https://getbootstrap.com/docs/4.3/components/pagination/](https://getbootstrap.com/docs/4.3/components/pagination/)
```html
<nav aria-label="Page navigation example">
  <ul class="pagination">
    <li class="page-item" :class="{'disabled': paginaActual === 1}">
      <router-link class="page-link" :to="{ query: { pagina: paginaActual - 1 }}">Anterior</router-link>
    </li>
    <li class="page-item" :class="{'active':paginaActual === index + 1}"
    v-for="(item, index) in cantidadPaginas" :key="index">
      <router-link :to="{ query: { pagina: index + 1 }}" class="page-link">{{index + 1}}</router-link>
    </li>
    <li class="page-item" :class="{'disabled': paginaActual === cantidadPaginas}">
      <router-link class="page-link" :to="{ query: { pagina: paginaActual + 1 }}">Siguiente</router-link>
    </li>
  </ul>
</nav>

<p>Total notas: {{totalNotas}} - Cantidad de páginas: {{cantidadPaginas}}</p>
```