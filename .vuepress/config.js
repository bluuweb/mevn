module.exports = {
  title: 'Vue.js, Node.js, Express & MongoDB [MEVN]',
  description: 'Aprende Full Stack Vue.js, Express & MongoDB',
  base: '/mevn/',
  locales:{
    '/':{
      lang: 'es-ES'
    }
  },
  themeConfig:{
    nav: [
      { text: 'Guía', link: '/' },
      { text: 'Vue.js Youtube', link: 'https://goo.gl/QzLoFY' },
      { text: 'Curso Vue.js Udemy', link: 'http://curso-vue-js-udemy.bluuweb.cl' },
    ],
    sidebar:[
        '/',
        '/01-primeros-pasos/',
        '/02-bases-datos/',
        '/03-vue/',
        '/04-auth/',
        '/05-nota-auth/',
        '/06-paginacion/'
      ]
  }
 
}