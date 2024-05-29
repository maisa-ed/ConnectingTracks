document.addEventListener('DOMContentLoaded', function () {
  // Inicialização do AOS
  AOS.init()

  // Configuração do Typed.js
  var options = {
    strings: [' TRILHAS SOB O OLHAR LOCAL'],
    typeSpeed: 50,
    loop: false,
  }

  // Inicialização do Typed.js
  var typed = new Typed('#typed-text', options)
})
