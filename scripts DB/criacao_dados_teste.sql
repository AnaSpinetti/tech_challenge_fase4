USE sistema_reservas;

INSERT INTO usuarios (nome, email, senha) VALUES 
('João Silva', 'joao@example.com', 'senha123'),
('Maria Santos', 'maria@example.com', 'senha456'),
('Pedro Oliveira', 'pedro@example.com', 'senha789');

INSERT INTO espacos (nome, capacidade, cidade, UF) VALUES 
('Sala de Reuniões A', 20, 'São Paulo', 'SP'),
('Auditório B', 100, 'Rio de Janeiro', 'RJ'),
('Sala de Treinamento C', 30, 'Belo Horizonte', 'MG');

INSERT INTO reservas (espaco_id, usuario, data_reserva, hora_inicio, hora_fim) VALUES 
(1, 1, '2024-05-20', '09:00:00', '11:00:00'),
(2, 2, '2024-05-22', '14:00:00', '17:00:00'),
(3, 3, '2024-05-25', '10:30:00', '12:30:00');
