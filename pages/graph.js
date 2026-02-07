async function loadEventSequence() {
    try {
        // Load event sequence data
        const response = await fetch('data/secuence.json');
        const data = await response.json();
        
        const sequence = data.sequence;
        const currentIndex = data.current_index;
        const currentEvent = sequence[currentIndex];
        
        // Load SVG diagram
        const svgResponse = await fetch('data/diagram.svg');
        const svgText = await svgResponse.text();
        
        const graphDiv = document.getElementById('event-graph');
        graphDiv.innerHTML = svgText;
        
        // Node color mapping
        const nodeColors = {
            "Joe's Game": '#AA00FF', // Purple
            'Catacombs': '#FFD600',   // Yellow
            'Living Totem': '#00C853',// Green
            'Vault Heist': '#FFCDD2', // Light pink
            'Mystic Realm': '#D50000' // Red
        };
        
        // Node ID mapping
        const nodeIdMap = {
            "Joe's Game": 'A',
            'Catacombs': 'B',
            'Vault Heist': 'C',
            'Mystic Realm': 'D',
            'Living Totem': 'E'
        };
        
        // Calculate previous and next events
        const sequenceIds = sequence.map(event => nodeIdMap[event]);
        const prevIndex = (currentIndex - 1 + sequence.length) % sequence.length;
        const nextIndex = (currentIndex + 1) % sequence.length;
        
        const currentNodeId = nodeIdMap[currentEvent];
        const prevNodeId = sequenceIds[prevIndex];
        const nextNodeId = sequenceIds[nextIndex];
        
        const svgElem = graphDiv.querySelector('svg');
        if (!svgElem) return;
        
        // Style nodes and connections and update event info
        styleNodes(svgElem, currentNodeId, nodeIdMap, currentEvent, nodeColors);        
        styleConnections(svgElem, currentNodeId, prevNodeId, nextNodeId);        
        updateEventInfo(sequence, currentIndex, prevIndex, nextIndex);
        
    } catch (error) {
        console.error('Failed to load event sequence:', error);
        document.getElementById('event-graph').textContent = 'Failed to load event sequence.';
    }
}

function styleNodes(svgElem, currentNodeId, nodeIdMap, currentEvent, nodeColors) {
    const currentColor = nodeColors[currentEvent];
    const rects = svgElem.querySelectorAll('rect.basic');
    
    rects.forEach(rect => {
        const nodeId = rect.getAttribute('data-id');
        const nodeGroup = rect.closest('g.node');
        
        if (nodeId === currentNodeId) {
            // Highlight current node
            rect.style.setProperty('fill', '#ffb347', 'important');
            rect.style.setProperty('stroke', '#ffb347', 'important');
            
            if (nodeGroup) {
                updateTextColor(nodeGroup, '#23283a');
            }
        } else {
            // Style other nodes with white border
            rect.style.setProperty('stroke', '#fff', 'important');
            rect.style.removeProperty('fill');
            
            if (nodeGroup) {
                updateTextColor(nodeGroup, '');
            }
        }
    });
}

function updateTextColor(nodeGroup, color) {
    const textElements = nodeGroup.querySelectorAll('foreignObject .nodeLabel p, foreignObject .nodeLabel span, foreignObject .nodeLabel');
    textElements.forEach(el => {
        el.style.setProperty('color', color, 'important');
        el.style.setProperty('fill', color, 'important');
    });
}

function styleConnections(svgElem, currentNodeId, prevNodeId, nextNodeId) {
    const paths = svgElem.querySelectorAll('path.flowchart-link');
    
    paths.forEach(path => {
        const pathId = path.getAttribute('id') || '';
        let color = '#fff'; // Default white
        
        // Previous to current connection (red)
        if (pathId === `L_${prevNodeId}_${currentNodeId}_0`) {
            color = '#dc4a4a';
        }
        // Current to next connection (green)
        else if (pathId === `L_${currentNodeId}_${nextNodeId}_0`) {
            color = '#16a451';
        }
        
        path.style.setProperty('stroke', color, 'important');
        updateMarkerColor(path, svgElem, color);
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

function updateEventInfo(sequence, currentIndex, prevIndex, nextIndex) {
    const infoDiv = document.getElementById('event-info');
    infoDiv.innerHTML = `
        <span style="color:#aaa">Previous:</span> <span style="color:#dc4a4a">${sequence[prevIndex]}</span> &nbsp;|&nbsp;
        <span style="color:#aaa">Current:</span> <span style="color:#ffb347">${sequence[currentIndex]}</span> &nbsp;|&nbsp;
        <span style="color:#aaa">Next:</span> <span style="color:#16a451">${sequence[nextIndex]}</span>
    `;
}

loadEventSequence();