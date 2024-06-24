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

document.addEventListener("DOMContentLoaded", function() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');

  if (eventId) {
      fetch(`/evento/${eventId}`)
          .then(response => response.json())
          .then(data => {
              document.getElementById('descricao').textContent = data.descricao;
              document.getElementById('data').textContent = data.data;
              document.getElementById('hora').textContent = data.hora;
              document.getElementById('local').textContent = data.local;
              document.getElementById('tempo').textContent = data.tempo;
              document.getElementById('dificuldade').textContent = data.dificuldade;
          });
  }
});
