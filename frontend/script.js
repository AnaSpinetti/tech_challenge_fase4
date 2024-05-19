document.addEventListener("DOMContentLoaded", function() {
    carregarLocaisDisponiveis();
});

// URL BASE DA API
const baseURL = 'http://localhost:3000';

// Iniciando o date picker
function initDatepicker(localId, datasReservadas) {
    $(`#datepicker_${localId}`).datepicker({
        beforeShowDay: function(date) {
            const dateString = $.datepicker.formatDate('yy-mm-dd', date);
            return [!datasReservadas.includes(dateString)];
        }
    });
}

// Carregando os locais disponiveis para reserva
function carregarLocaisDisponiveis() {
    fetch(baseURL + '/api/locais')
    .then(response => response.json())
    .then(data => {
        const locais = data;

        const locaisDiv = document.getElementById('locais');
        locaisDiv.innerHTML = '<h2>Locais Disponíveis</h2>';

        locais.forEach(local => {
            const localContainer = document.createElement('div');
            localContainer.classList.add('locaisContainer');

            // Renderiza as informações do local
            localContainer.innerHTML = `<h3>${local.nome}</h3>
            <p>${local.cidade} - ${local.UF}</p>
            <p>Capacidade: ${local.capacidade} pessoas</p>
            <label for="datepicker_${local.id}">Selecione a data:</label>
            <input type="text" id="datepicker_${local.id}" name="datepicker_${local.id}">

            <label for="horario_${local.id}">Check-in:</label>
            <select id="horario_inicio_${local.id}" name="horario_inicio_${local.id}">
                <option value="" selected disabled></option>
            </select>

            <label for="horario_${local.id}">Check-out:</label>
            <select id="horario_fim_${local.id}" name="horario_fim_${local.id}">
                <option value="" selected disabled></option>
            </select>
            
            <button onclick="reservarLocal(${local.id})">Reservar</button>`;

            // Insere o container na tela inicial
            locaisDiv.appendChild(localContainer);

            // Carrega as datas reservadas e os horários disponíveis para o local atual
            fetch(`${baseURL}/api/reservas/espaco/${local.id}`)
            .then(response => response.json())
            .then(data => {
                const datasReservadas = data.map(reserva => reserva.data_reserva.split('T')[0]);
                const horariosReservados = data.map(reserva => ({
                    inicio: reserva.hora_inicio.split(':')[0],
                    fim: reserva.hora_fim.split(':')[0]
                }));
                initDatepicker(local.id, datasReservadas);
                popularHorarios(local.id, horariosReservados);
            })
            .catch(error => console.error('Erro ao carregar datas reservadas:', error));
        });
    })
    .catch(error => console.error('Erro ao carregar locais:', error));
}

function popularHorarios(localId, horariosReservados) {
    const selectInicio = document.getElementById(`horario_inicio_${localId}`);
    const selectFim = document.getElementById(`horario_fim_${localId}`);

    for (let hora = 0; hora < 24; hora++) {
        const optionInicio = document.createElement('option');
        optionInicio.value = hora.toString().padStart(2, '0') + ':00'; 
        optionInicio.textContent = hora.toString().padStart(2, '0') + ':00';

        const optionFim = document.createElement('option');
        optionFim.value = hora.toString().padStart(2, '0') + ':00'; 
        optionFim.textContent = hora.toString().padStart(2, '0') + ':00';

        if (horariosReservados.some(reserva => reserva.inicio <= hora && hora < reserva.fim)) {
            optionInicio.disabled = true; // Desabilita horários já reservados
            optionFim.disabled = true; // Desabilita horários já reservados
        }
        selectInicio.appendChild(optionInicio);
        selectFim.appendChild(optionFim);
    }
}

function reservarLocal(localId) {
    const dataReservaRaw = $(`#datepicker_${localId}`).datepicker('getDate');
    const dataReserva = dataReservaRaw.toISOString().split('T')[0]; // Convertendo para o formato "YYYY-MM-DD"
    const horaInicio = $(`#horario_inicio_${localId}`).val();
    const horaFim = $(`#horario_fim_${localId}`).val();

    // Validar se todos os campos foram preenchidos
    if (!dataReserva || !horaInicio || !horaFim) {
        alert('Por favor, preencha todos os campos para fazer a reserva.');
        return;
    }

    // Enviar a solicitação de reserva para o servidor
    const reserva = {
        espaco_id: localId,
        usuario: 1,
        data_reserva: dataReserva,
        hora_inicio: horaInicio,
        hora_fim: horaFim
    };

    fetch(`${baseURL}/api/reservar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reserva)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => console.error('Erro ao fazer reserva:', error));
}

