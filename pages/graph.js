const CONFIG = {
    BASE_DATE: new Date(Date.UTC(2026, 1, 11, 0, 0, 0)), 
    MS_PER_EVENT: 3 * 24 * 60 * 60 * 1000,
    NODE_ID_MAP: {
        "Joe's Game": 'A',
        'Catacombs': 'B',
        'Vault Heist': 'C',
        'Mystic Realm': 'D',
        'Living Totem': 'E'
    }
};

let eventSequence = [];
let svgLoaded = false;

async function init() {
    try {
        // Cargar la secuencia del JSON
        const response = await fetch('data/sequence.json');
        const data = await response.json();
        eventSequence = data.sequence || data.secuence;

        // Cargar el SVG
        const svgResponse = await fetch('data/diagram.svg');
        const svgText = await svgResponse.text();
        document.getElementById('event-graph').innerHTML = svgText;
        svgLoaded = true;

        updateLoop();
        setInterval(updateLoop, 1000);
    } catch (error) {
        console.error('Error cargando la aplicación:', error);
        document.getElementById('event-graph').textContent = 'Error al cargar los datos del evento.';
    }
}

// 2. Bucle principal de actualización (Reloj y Grafo)
function updateLoop() {
    if (!eventSequence.length || !svgLoaded) return;

    const now = new Date();
    const timeDiff = now.getTime() - CONFIG.BASE_DATE.getTime();    
    const elapsedEvents = Math.floor(timeDiff / CONFIG.MS_PER_EVENT);
    const currentIndex = ((elapsedEvents % eventSequence.length) + eventSequence.length) % eventSequence.length;    
    const prevIndex = (currentIndex - 1 + eventSequence.length) % eventSequence.length;
    const nextIndex = (currentIndex + 1) % eventSequence.length;
    const nextEventTime = new Date(CONFIG.BASE_DATE.getTime() + (elapsedEvents + 1) * CONFIG.MS_PER_EVENT);

    // Actualizar UI
    renderGraph(currentIndex, prevIndex, nextIndex);
    renderCountdown(nextEventTime);
    renderInfoText(currentIndex, prevIndex, nextIndex);
}

function renderGraph(currIdx, prevIdx, nextIdx) {
    const svgElem = document.querySelector('#event-graph svg');
    if (!svgElem) return;

    const currentNodeId = CONFIG.NODE_ID_MAP[eventSequence[currIdx]];
    const prevNodeId = CONFIG.NODE_ID_MAP[eventSequence[prevIdx]];
    const nextNodeId = CONFIG.NODE_ID_MAP[eventSequence[nextIdx]];

    // Estilizar Nodos (Rectángulos)
    svgElem.querySelectorAll('rect.basic').forEach(rect => {
        const nodeId = rect.getAttribute('data-id');
        const nodeGroup = rect.closest('g.node');
        
        if (nodeId === currentNodeId) {
            rect.style.setProperty('fill', '#ffb347', 'important');
            rect.style.setProperty('stroke', '#ffb347', 'important');
            if (nodeGroup) updateTextColor(nodeGroup, '#23283a');
        } else {
            rect.style.setProperty('stroke', '#fff', 'important');
            rect.style.removeProperty('fill');
            if (nodeGroup) updateTextColor(nodeGroup, '');
        }
    });

    svgElem.querySelectorAll('path.flowchart-link').forEach(path => {
        const pathId = path.getAttribute('id') || '';
        let color = '#fff';

        // Conexión entrada (rojo) y salida (verde)
        if (pathId === `L_${prevNodeId}_${currentNodeId}_0`) {
            color = '#dc4a4a';
        } else if (pathId === `L_${currentNodeId}_${nextNodeId}_0`) {
            color = '#16a451';
        }
        
        path.style.setProperty('stroke', color, 'important');
        updateMarkerColor(path, svgElem, color);
    });
}

function updateTextColor(nodeGroup, color) {
    const textElements = nodeGroup.querySelectorAll('foreignObject .nodeLabel p, foreignObject .nodeLabel span, foreignObject .nodeLabel');
    textElements.forEach(el => {
        el.style.setProperty('color', color, 'important');
        el.style.setProperty('fill', color, 'important');
    });
}

function updateMarkerColor(path, svgElem, color) {
    const marker = path.getAttribute('marker-end');
    if (!marker) return;
    const markerMatch = marker.match(/#([^)]+)/);
    if (!markerMatch) return;
    
    const markerId = markerMatch[1];
    const markerElem = svgElem.getElementById(markerId);
    if (!markerElem) return;
    
    const markerPath = markerElem.querySelector('path');
    if (markerPath) {
        markerPath.setAttribute('stroke', color);
        markerPath.setAttribute('fill', color);
    }
}

function renderInfoText(curr, prev, next) {
    const infoDiv = document.getElementById('event-info');
    if (!infoDiv) return;
    infoDiv.innerHTML = `
        <span style="color:#aaa">Previous:</span> <span style="color:#dc4a4a">${eventSequence[prev]}</span> &nbsp;|&nbsp;
        <span style="color:#aaa">Actual:</span> <span style="color:#ffb347">${eventSequence[curr]}</span> &nbsp;|&nbsp;
        <span style="color:#aaa">Next:</span> <span style="color:#16a451">${eventSequence[next]}</span>
    `;
}

function renderCountdown(nextTime) {
    const now = new Date();
    const timeLeft = nextTime - now;
    
    if (timeLeft < 0) return;

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);

    const countdownDiv = document.getElementById('event-countdown');
    if (countdownDiv) {
        countdownDiv.innerHTML = `
            <span style="color:#aaa">${days}d : </span>
            <span style="color:#aaa">${hours.toString().padStart(2, '0')}h : </span>
            <span style="color:#aaa">${minutes.toString().padStart(2, '0')}m : </span>
            <span style="color:#aaa">${seconds.toString().padStart(2, '0')}s</span>
        `;
    }
}

init();