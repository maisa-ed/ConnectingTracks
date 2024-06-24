const bcrypt = require('bcrypt'); // Para hashing de senhas

// Adicionar campo de senha na tabela de usuários
db.run(`ALTER TABLE usuarios ADD COLUMN senha TEXT`, (err) => {
  if (err && !err.message.includes('duplicate column name')) {
    console.error(err.message);
  }
});

// Rota para processar o login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, user) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!user) {
      res.status(401).json({ error: 'Email não encontrado' });
      return;
    }

    // Comparar a senha fornecida com a senha armazenada
    bcrypt.compare(password, user.senha, (err, result) => {
      if (result) {
        // Login bem-sucedido
        req.session.user = user;
        res.redirect('/index');
      } else {
        // Senha incorreta
        res.status(401).json({ error: 'Senha incorreta' });
      }
    });
  });
});
