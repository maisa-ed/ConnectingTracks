const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Configurar bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

// Criar tabela de eventos se não existir
db.run(`CREATE TABLE IF NOT EXISTS eventos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT NOT NULL,
    data TEXT NOT NULL,
    hora TEXT NOT NULL,
    local TEXT NOT NULL,
    tempo TEXT NOT NULL,
    dificuldade TEXT NOT NULL
)`);

// Rota para servir os arquivos estáticos
app.use(express.static(path.join(__dirname, 'views')));

// Rota para processar o formulário
// Rota para processar o formulário
app.post('/evento', (req, res) => {
    const { descricao, data, hora, local, tempo, dificuldade } = req.body;

    const query = `INSERT INTO eventos (descricao, data, hora, local, tempo, dificuldade) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [descricao, data, hora, local, tempo, dificuldade];

    db.run(query, params, function(err) {
        if (err) {
            console.error('Erro ao inserir dados no banco de dados:', err.message);
            res.status(500).send('Erro ao salvar o evento');
        } else {
            res.redirect(`/evento.html?id=${this.lastID}`);
        }
    });
});

// Rota para buscar um evento específico
app.get('/evento/:id', (req, res) => {
    const { id } = req.params;

    const query = `SELECT * FROM eventos WHERE id = ?`;
    db.get(query, [id], (err, row) => {
        if (err) {
            console.error('Erro ao buscar evento:', err.message);
            res.status(500).send('Erro ao buscar o evento');
        } else {
            res.json(row);
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
