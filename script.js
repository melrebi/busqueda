// IMPORTANTE: Pega aquí la URL de tu aplicación web de Apps Script
const APPS_SCRIPT_URL = 'AKfycbytcfgYivgEDt0Hv34XfrM8r2Bkr3Lqu7Ycph3O-PTrKtfd2bpSpFOoQL-UbvVD0vFknw';

const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');
const loader = document.getElementById('loader');

// Escuchar el evento 'keyup' para buscar mientras el usuario escribe
searchInput.addEventListener('keyup', () => {
    const query = searchInput.value.trim();

    // Solo buscar si hay al menos 2 caracteres
    if (query.length > 1) {
        fetchResults(query);
    } else {
        resultsContainer.innerHTML = ''; // Limpiar resultados si la búsqueda es corta
    }
});

async function fetchResults(query) {
    loader.style.display = 'block'; // Mostrar el indicador de carga
    resultsContainer.innerHTML = ''; // Limpiar resultados anteriores

    // Construir la URL final para la solicitud GET
    const url = `${APPS_SCRIPT_URL}?query=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error en la respuesta de la red.');
        }
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        console.error('Error al buscar datos:', error);
        resultsContainer.innerHTML = '<p>Hubo un error al realizar la búsqueda. Inténtalo de nuevo.</p>';
    } finally {
        loader.style.display = 'none'; // Ocultar el indicador de carga
    }
}

function displayResults(data) {
    if (data.length === 0) {
        resultsContainer.innerHTML = '<p>No se encontraron resultados para tu búsqueda.</p>';
        return;
    }

    // Crear una tarjeta para cada resultado
    data.forEach(item => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';

        let content = '';
        // Crear HTML para cada propiedad del objeto
        for (const key in item) {
            if (key.toLowerCase() === 'nombreproducto') { // Tratar un campo como título
                content += `<h3>${item[key]}</h3>`;
            } else {
                content += `<p><strong>${key}:</strong> ${item[key]}</p>`;
            }
        }
        resultItem.innerHTML = content;
        resultsContainer.appendChild(resultItem);
    });
}