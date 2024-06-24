const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Substitua pelos seus valores


const app = express();
const port = 3000;

// Configuração do banco de dados SQLite
const db = new sqlite3.Database('./meu_banco_de_dados.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        // Criar a tabela de usuários se não existir
        db.run(`CREATE TABLE IF NOT EXISTS usuarios (
          id TEXT PRIMARY KEY,
          nome TEXT,
          email TEXT UNIQUE
        )`);
        // Criar a tabela de eventos se não existir
        db.run(`CREATE TABLE IF NOT EXISTS eventos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT,
          descricao TEXT,
          data TEXT,
          hora TEXT,
          local TEXT,
          tempo TEXT,
          dificuldade TEXT,
          aprovado INTEGER DEFAULT 0,
          linkWhats TEXT
        )`);
    }
});

// Middleware para sessões
app.use(session({ secret: 'seu_segredo', resave: false, saveUninitialized: true }));

// Configuração do body-parser para analisar solicitações POST
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração do Passport
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    const { id, displayName, emails } = profile;
    const email = emails[0].value;

    db.run('INSERT OR IGNORE INTO usuarios (id, nome, email) VALUES (?, ?, ?)', [id, displayName, email], (err) => {
        if (err) {
            return done(err);
        }
        return done(null, profile);
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Inicializar Passport e sessões
app.use(passport.initialize());
app.use(passport.session());

// Configuração para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'views')));

// Rotas
app.get('/evento', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'evento.html'));
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/login.html');
  }
);

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.post('/evento', (req, res) => {
  const { nome, descricao, data, hora, local, tempo, dificuldade, linkWhats } = req.body;

  const query = `INSERT INTO eventos (nome, descricao, data, hora, local, tempo, dificuldade, linkWhats) VALUES (?, ?, ? , ?, ?, ?, ?, ?)`;
  const params = [nome, descricao, data, hora, local, tempo, dificuldade, linkWhats];

  db.run(query, params, function(err) {
    if (err) {
      console.error('Erro ao inserir dados no banco de dados:', err.message);
      res.status(500).send('Erro ao salvar o evento');
    } else {
      res.redirect(`/login.html`);
    }
  });
});

app.get('/evento/:id', (req, res) => {
  const eventId = req.params.id;
  const query = `SELECT * FROM eventos WHERE id = ?`;

  db.get(query, [eventId], (err, row) => {
    if (err) {
      console.error('Erro ao buscar dados no banco de dados:', err.message);
      res.status(500).send('Erro ao buscar o evento');
    } else if (!row) {
      res.status(404).send('Evento não encontrado');
    } else {
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Detalhes da Trilha</title>
          <link rel="stylesheet" href="/stylesfor.css">
        </head>
        <body>
          <h1>Detalhes do Evento</h1>
          <p><strong>Nome:</strong${row.nome}</p>
          <p><strong>Descrição:</strong> ${row.descricao}</p>
          <p><strong>Data:</strong> ${row.data}</p>
          <p><strong>Hora:</strong> ${row.hora}</p>
          <p><strong>Local:</strong> ${row.local}</p>
          <p><strong>Tempo:</strong> ${row.tempo}</p>
          <p><strong>Dificuldade:</strong> ${row.dificuldade}</p>
          <p><strong>Link WhatsApp:</strong> <a href="${evento.linkWhats}" target="_blank">${evento.linkWhats}</a></p>
          <a href="/index.html">Voltar</a>
        </body>
        </html>
      `);
    }
  });
});

// Rota para buscar todos os eventos
app.get('/eventos', (req, res) => {
  const query = `SELECT * FROM eventos`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar dados no banco de dados:', err.message);
      res.status(500).send('Erro ao buscar os eventos');
    } else {
      res.json(rows);
    }
  });
});

// Rotas para aprovar ou reprovar eventos
app.post('/evento/:id/aprovar', (req, res) => {
  const eventId = req.params.id;
  const query = `UPDATE eventos SET aprovado = 1 WHERE id = ?`;

  db.run(query, [eventId], function(err) {
    if (err) {
      console.error('Erro ao atualizar o evento no banco de dados:', err.message);
      res.status(500).send('Erro ao aprovar o evento');
    } else {
      res.sendStatus(200);
    }
  });
});

app.post('/evento/:id/reprovar', (req, res) => {
  const eventId = req.params.id;
  const query = `UPDATE eventos SET aprovado = -1 WHERE id = ?`;

  db.run(query, [eventId], function(err) {
    if (err) {
      console.error('Erro ao atualizar o evento no banco de dados:', err.message);
      res.status(500).send('Erro ao reprovar o evento');
    } else {
      res.sendStatus(200);
    }
  });
});

app.get('/eventos/recentes', (req, res) => {
  const query = `
    SELECT * FROM eventos 
    WHERE aprovado = 1 
    ORDER BY data ASC, hora ASC 
    LIMIT 3
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar dados no banco de dados:', err.message);
      res.status(500).send('Erro ao buscar os eventos');
    } else {
      res.json(rows);
    }
  });
});

// Rota para retornar todas as trilhas aprovadas exceto as 3 mais recentes
app.get('/eventos/todas', (req, res) => {
  const query = `
    SELECT * FROM eventos 
    WHERE aprovado = 1 
    ORDER BY data ASC, hora ASC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar dados no banco de dados:', err.message);
      res.status(500).send('Erro ao buscar os eventos');
    } else {
      res.json(rows);
    }
  });
});


app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});