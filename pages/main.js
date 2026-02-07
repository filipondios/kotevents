// Mostrar el grafo exportado como SVG y resaltar el nodo actual
fetch('data/secuence.json')
	.then(response => response.json())
	.then(data => {
		const sequence = data.sequence;
		const currentIndex = data.current_index;
		const currentEvent = sequence[currentIndex];
		const graphDiv = document.getElementById('event-graph');
		fetch('data/diagram.svg')
			.then(resp => resp.text())
			.then(svgText => {
				graphDiv.innerHTML = svgText;
				// Colores de borde únicos para cada nodo
				const nodeColors = {
					"Joe's Game": '#AA00FF', // violeta
					'Catacombs': '#FFD600',   // amarillo
					'Living Totem': '#00C853',// verde
					'Vault Heist': '#FFCDD2', // rosa claro
					'Mystic Realm': '#D50000' // rojo
				};
				const currentColor = nodeColors[currentEvent];
				const svgElem = graphDiv.querySelector('svg');
				// Mapeo de nodos a ids
				const nodeIdMap = {
					"Joe's Game": 'A',
					'Catacombs': 'B',
					'Vault Heist': 'C',
					'Mystic Realm': 'D',
					'Living Totem': 'E'
				};
				// Mapeo de ids a evento
				const eventById = Object.fromEntries(Object.entries(nodeIdMap).map(([k, v]) => [v, k]));
				const currentNodeId = nodeIdMap[currentEvent];
				// Calcular anterior y siguiente
				const sequenceIds = sequence.map(ev => nodeIdMap[ev]);
				const prevIndex = (currentIndex - 1 + sequence.length) % sequence.length;
				const nextIndex = (currentIndex + 1) % sequence.length;
				const prevNodeId = sequenceIds[prevIndex];
				const nextNodeId = sequenceIds[nextIndex];
				if (svgElem) {
					// Nodos: resaltar actual, el resto fondo original y borde blanco
					const rects = svgElem.querySelectorAll('rect.basic');
					rects.forEach(rect => {
						const style = rect.getAttribute('style') || '';
						const stroke = rect.getAttribute('stroke') || '';
						// Detectar id del nodo por data-id
						const nodeId = rect.getAttribute('data-id');
						if ((style.includes(currentColor) || stroke === currentColor) && nodeId === currentNodeId) {
							rect.style.setProperty('fill', '#ffb347', 'important');
							rect.style.setProperty('stroke', '#ffb347', 'important');
							const nodeGroup = rect.closest('g.node');
							if (nodeGroup) {
								const textP = nodeGroup.querySelectorAll('foreignObject .nodeLabel p, foreignObject .nodeLabel span, foreignObject .nodeLabel');
								textP.forEach(el => {
									el.style.setProperty('color', '#23283a', 'important');
									el.style.setProperty('fill', '#23283a', 'important');
								});
							}
						} else {
							// Solo borde blanco, mantener color de fondo original
							rect.style.setProperty('stroke', '#fff', 'important');
							rect.style.removeProperty('fill');
							// Color de texto original
							const nodeGroup = rect.closest('g.node');
							if (nodeGroup) {
								const textP = nodeGroup.querySelectorAll('foreignObject .nodeLabel p, foreignObject .nodeLabel span, foreignObject .nodeLabel');
								textP.forEach(el => {
									el.style.setProperty('color', '', 'important');
									el.style.setProperty('fill', '', 'important');
								});
							}
						}
					});
					// Links: todas blancas, menos la entrante (rojo) y saliente (verde)
					// Buscar todas las paths de aristas
					const paths = svgElem.querySelectorAll('path.flowchart-link');
					paths.forEach(path => {
						// Por id: L_X_Y_0, donde X=from, Y=to
						const id = path.getAttribute('id') || '';
						let color = '#fff';
						// Entrante: del nodo anterior al actual
						if (id === `L_${prevNodeId}_${currentNodeId}_0`) color = '#dc4a4a'; // rojo
						// Saliente: del nodo actual al siguiente
						if (id === `L_${currentNodeId}_${nextNodeId}_0`) color = '#16a451'; // verde
						path.style.setProperty('stroke', color, 'important');
						// Cambiar color de la flecha (marker)
						const marker = path.getAttribute('marker-end');
						if (marker) {
							// marker-end="url(#export-svg_flowchart-v2-pointEnd__AA00FF)"
							const markerId = marker.match(/#([^)]+)/);
							if (markerId && svgElem.getElementById(markerId[1])) {
								const markerElem = svgElem.getElementById(markerId[1]);
								const markerPath = markerElem.querySelector('path');
								if (markerPath) markerPath.setAttribute('stroke', color), markerPath.setAttribute('fill', color);
							}
						}
					});
				}
			});
		// Flechas anterior/siguiente
		const prevIndex = (currentIndex - 1 + sequence.length) % sequence.length;
		const nextIndex = (currentIndex + 1) % sequence.length;
		const infoDiv = document.getElementById('event-info');
		infoDiv.innerHTML =
			`<span style="color:#aaa">Previous:</span> <span style="color:#dc4a4a">${sequence[prevIndex]}</span> &nbsp;|&nbsp; ` +
			`<span style="color:#aaa">Actual:</span> <span style="color:#ffb347">${sequence[currentIndex]}</span> &nbsp;|&nbsp; ` +
			`<span style="color:#aaa">Next:</span> <span style="color:#16a451">${sequence[nextIndex]}</span>`;

		// Contador hasta el siguiente evento
		function updateCountdown() {
			// El siguiente evento empieza a las 00:00 GMT, cada 3 días
			const now = new Date();
			// Buscar la próxima 00:00 GMT
			let next = new Date(now);
			next.setUTCHours(0, 0, 0, 0); // 0:00 GMT
			if (now >= next) {
				next.setUTCDate(next.getUTCDate() + 1);
			}
			// Calcular el offset de días hasta el siguiente cambio de evento
			// El ciclo es de 8 eventos, cada uno dura 3 días
			// Suponemos que el primer evento empezó en una fecha base conocida
			// Usamos como base el 2024-01-01 0:00 GMT (ajustar si tienes otra base)
			const base = new Date(Date.UTC(2024, 0, 1, 0, 0, 0, 0));
			const msPerEvent = 3 * 24 * 60 * 60 * 1000;
			let diff = next - base;
			let mod = diff % msPerEvent;
			if (mod !== 0) {
				next = new Date(next.getTime() + (msPerEvent - mod));
			}
			// Ahora next es el inicio del siguiente evento
			let msLeft = next - now;
			if (msLeft < 0) msLeft = 0;
			const days = Math.floor(msLeft / (1000 * 60 * 60 * 24));
			const hours = Math.floor((msLeft / (1000 * 60 * 60)) % 24);
			const minutes = Math.floor((msLeft / (1000 * 60)) % 60);
			const seconds = Math.floor((msLeft / 1000) % 60);
			const countdownDiv = document.getElementById('event-countdown');
			if (countdownDiv) {
				countdownDiv.innerHTML =
					`<span style="color:#aaa">${days} days : </span>` +
					`<span style="color:#aaa">${hours.toString().padStart(2, '0')}h : </span>` +
					`<span style="color:#aaa">${minutes.toString().padStart(2, '0')}m : </span>` +
					`<span style="color:#aaa">${seconds.toString().padStart(2, '0')}s</span>`;
			}
		}
		updateCountdown();
		setInterval(updateCountdown, 1000);
	})
	.catch(err => {
		document.getElementById('event-graph').textContent = 'No se pudo cargar la secuencia de eventos.';
	});
