const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

const port = 3000;
app.use(cors());

// Configuração do banco de dados
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'redrose3',
    database: 'sistema_reservas'
});

// Conversão JSON
app.use(bodyParser.json());

// Obter todos os locais
app.get('/api/locais', (req, res) => {
    connection.query('SELECT * FROM espacos', (error, results) => {
        if (error) {
            console.error('Erro ao buscar os locais:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
            return;
        }
        res.json(results);
    });
});

// Obter todas as reservas
app.get('/api/reservas', (req, res) => {
    connection.query('SELECT * FROM reservas', (error, results) => {
        if (error) {
            console.error('Erro ao buscar as reservas:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
            return;
        }
        res.json(results);
    });
});

// obter reservas de acordo com o usuario
app.get('/api/reservas/usuario/:usuario', (req, res) => {
    const usuario = req.params.usuario;
    connection.query('SELECT * FROM reservas WHERE usuario = ?', [usuario], (error, results) => {
        if (error) {
            console.error('Erro ao buscar as reservas do usuário:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
            return;
        }
        res.json(results);
    });
});

// obter reservas de acordo com o "espaco_id"
app.get('/api/reservas/espaco/:espaco_id', (req, res) => {
    const espaco_id = req.params.espaco_id;
    connection.query('SELECT * FROM reservas WHERE espaco_id = ?', [espaco_id], (error, results) => {
        if (error) {
            console.error('Erro ao buscar as reservas do espaço:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
            return;
        }
        res.json(results);
    });
});


// Reservar local
app.post('/api/reservar', (req, res) => {
    const { espaco_id, usuario, data_reserva, hora_inicio, hora_fim } = req.body;
    // Validar se a diferença entre hora_inicio e hora_fim é maior que 8 horas
    const diffInHours = (new Date(hora_fim) - new Date(hora_inicio)) / (1000 * 60 * 60);
    if (diffInHours > 8) {
        res.status(400).json({ error: 'Intervalo de reserva excede 8 horas' });
        return;
    }

    // Validar se já existe reserva para o mesmo espaço e horário
    connection.query('SELECT COUNT(*) AS count FROM reservas WHERE espaco_id = ? AND data_reserva = ? AND ((hora_inicio <= ? AND hora_fim > ?) OR (hora_inicio < ? AND hora_fim >= ?))',
        [espaco_id, data_reserva, hora_fim, hora_inicio, hora_inicio, hora_fim], (error, results) => {
            if (error) {
                console.error('Erro ao verificar a reserva:', error);
                res.status(500).json({ error: 'Erro interno do servidor' });
                return;
            }

            // Validando se o Count retornou algum resultado
            const count = results[0].count;
            if (count > 0) {
                res.status(400).json({ error: 'Já existe uma reserva para este espaço neste horário' });
                return;
            }

            // Se não retornar dados do count, inserimos a nova reserva
            connection.query('INSERT INTO reservas (espaco_id, usuario, data_reserva, hora_inicio, hora_fim) VALUES (?, ?, ?, ?, ?)',
                [espaco_id, usuario, data_reserva, hora_inicio, hora_fim], (error, results) => {
                    if (error) {
                        console.error('Erro ao fazer a reserva:', error);
                        res.status(500).json({ error: 'Erro interno do servidor' });
                        return;
                    }
                    res.json({ message: 'Reserva feita com sucesso!' });
                });
        });
});


// Alterar reserva
app.put('/api/reservar/:id', (req, res) => {
    const reservaId = req.params.id;
    const { espaco_id, data_reserva, hora_inicio, hora_fim } = req.body;

    // Validar se a diferença entre hora_inicio e hora_fim é maior que 8 horas
    const diffInHours = (new Date(hora_fim) - new Date(hora_inicio)) / (1000 * 60 * 60);
    if (diffInHours > 8) {
        res.status(400).json({ error: 'Intervalo de reserva excede 8 horas' });
        return;
    }

    // Validar se já existe outra reserva para o mesmo espaço e horário
    connection.query('SELECT COUNT(*) AS count FROM reservas WHERE espaco_id = ? AND data_reserva = ? AND ((hora_inicio <= ? AND hora_fim > ?) OR (hora_inicio < ? AND hora_fim >= ?)) AND id != ?',
        [espaco_id, data_reserva, hora_fim, hora_inicio, hora_inicio, hora_fim, reservaId], (error, results) => {
            if (error) {
                console.error('Erro ao verificar a reserva:', error);
                res.status(500).json({ error: 'Erro interno do servidor' });
                return;
            }
            const countResult = results[0].count;
            if (countResult > 0) {
                res.status(400).json({ error: 'Já existe outra reserva para este espaço neste horário' });
                return;
            }

            // Fazer reserva
            connection.query('UPDATE reservas SET espaco_id = ?, data_reserva = ?, hora_inicio = ?, hora_fim = ? WHERE id = ?',
                [espaco_id, data_reserva, hora_inicio, hora_fim, reservaId], (error, results) => {
                    if (error) {
                        console.error('Erro ao atualizar a reserva:', error);
                        res.status(500).json({ error: 'Erro interno do servidor' });
                        return;
                    }
                    res.json({ message: 'Reserva atualizada com sucesso!' });
                });
        });
});

// Cancelar reserva
app.delete('/api/cancelar/:id', (req, res) => {
    const reservaId = req.params.id; // Get reservation ID from URL parameter

    // Check if the reservation ID is provided
    if (!reservaId) {
        res.status(400).json({ error: 'ID da reserva não fornecido' });
        return;
    }

    // Check if the reservation exists
    connection.query('SELECT * FROM reservas WHERE id = ?', [reservaId], (error, results) => {
        if (error) {
            console.error('Erro ao verificar a reserva:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
            return;
        }

        // If no reservation found with the given ID, send an error response
        if (results.length === 0) {
            res.status(404).json({ error: 'Reserva não encontrada' });
            return;
        }

        // Reservation exists, proceed with deletion
        connection.query('DELETE FROM reservas WHERE id = ?', [reservaId], (error, results) => {
            if (error) {
                console.error('Erro ao cancelar a reserva:', error);
                res.status(500).json({ error: 'Erro interno do servidor' });
                return;
            }
            res.json({ message: 'Reserva cancelada com sucesso!' });
        });
    });
});


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
