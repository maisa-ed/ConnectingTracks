document
  .getElementById('loginForm')
  .addEventListener('submit', function (event) {
    event.preventDefault()
    // Aqui você pode adicionar a lógica para autenticar o usuário
    alert('Login efetuado com sucesso!')
  })

document
  .getElementById('forgotPassword')
  .addEventListener('click', function (event) {
    event.preventDefault()
    // Aqui você pode adicionar a lógica para recuperação de senha
    alert('Link para recuperação de senha enviado para seu email!')
  })
