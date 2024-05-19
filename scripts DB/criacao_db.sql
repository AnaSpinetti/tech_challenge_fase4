CREATE DATABASE sistema_reservas;

USE sistema_reservas;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    senha VARCHAR(50) NOT NULL
);

CREATE TABLE espacos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    capacidade INT(10) NOT NULL,
    cidade VARCHAR(30) NOT NULL,
    UF VARCHAR(2) NOT NULL
);

CREATE TABLE reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    espaco_id INT,
    usuario INT,
    data_reserva DATE,
    hora_inicio TIME,
    hora_fim TIME,
    FOREIGN KEY (espaco_id) REFERENCES espacos(id),
    FOREIGN KEY (usuario) REFERENCES usuarios(id)
);
