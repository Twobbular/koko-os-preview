// Home screen battery indicator
const batteryLevel = 62;
const batteryLevelElement = document.querySelector('.level');
const batteryPercentElement = document.querySelector('.percent');

batteryPercentElement.textContent = `${batteryLevel}%`;
batteryLevelElement.style.width = `${batteryLevel}%`;

if (batteryLevel < 20) {
    batteryLevelElement.style.backgroundColor = '#ff0000';
} else if (batteryLevel < 30) {
    batteryLevelElement.style.backgroundColor = '#ffcc00';
} else if (batteryLevel < 80) {
    batteryLevelElement.style.backgroundColor = '#19b44a';
} else {
    batteryLevelElement.style.backgroundColor = '#34C759';
}


// Integrated customizable Control Center
(() => {
    'use strict';

    const musicWidgetHtml = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
        *{box-sizing:border-box}body{margin:0;min-height:100vh;padding:12px;display:grid;place-items:center;background:transparent;color:#f4f8f8;font:12px/1.2 Segoe UI,sans-serif;overflow:hidden}.music-widget{width:100%;min-width:0;display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:10px}.art{width:42px;height:42px;display:grid;place-items:center;border-radius:10px;background:#235e68;color:#62d8d0;font-size:16px}.track,.artist{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.track{font-weight:700}.artist{margin-top:4px;color:#9baeb0;font-size:10px}.controls{display:flex;align-items:center;gap:4px}button{width:30px;height:30px;padding:0;border:0;border-radius:50%;background:transparent;color:#f4f8f8;cursor:pointer;font-size:13px}.play{background:#62d8d0;color:#123238}@media(max-width:220px){body{padding:8px}.music-widget{grid-template-columns:34px minmax(0,1fr) auto;gap:6px}.art{width:34px;height:34px;font-size:13px}button{width:26px;height:26px;font-size:11px}.track{font-size:11px}.artist{font-size:9px}}@media(max-width:135px){.music-widget{display:flex;justify-content:center}.art,.track,.artist{display:none}.controls{gap:2px}.controls button:not(.play){display:none}button{width:25px;height:25px;font-size:10px}}@media(max-height:70px){body{padding:4px}button{width:24px;height:24px}}
    </style></head><body><main class="music-widget" aria-label="Music player"><div class="art">&#9835;</div><div><div class="track">Midnight City</div><div class="artist">M83</div></div><div class="controls"><button type="button" aria-label="Previous track">&#9198;</button><button type="button" class="play" aria-label="Play" id="play">&#9654;</button><button type="button" aria-label="Next track">&#9197;</button></div></main><script>const button=document.getElementById('play');let playing=false;button.onclick=()=>{playing=!playing;button.innerHTML=playing?'&#10074;&#10074;':'&#9654;';button.setAttribute('aria-label',playing?'Pause':'Play')};</script></body></html>`;

    const masterControls = {
        wifi: { name: 'Wi-Fi', sub: 'Home', icon: 'fa-wifi', type: 'toggle', size: 'c2r1' },
        bluetooth: { name: 'Bluetooth', sub: 'Connected', icon: 'fa-bluetooth-b', brand: true, type: 'toggle', size: 'c2r1' },
        airplane: { name: 'Airplane', icon: 'fa-plane', type: 'toggle', size: 'c1r1' },
        rotation: { name: 'Rotation', sub: 'Unlocked', icon: 'fa-rotate-right', type: 'toggle', size: 'c1r1' },
        location: { name: 'Location', icon: 'fa-location-dot', type: 'toggle', size: 'c1r1', warn: true },
        battery: { name: 'Battery Saver', sub: 'Mode', icon: 'fa-battery-half', type: 'toggle', size: 'c2r2' },
        darkmode: { name: 'Dark Mode', icon: 'fa-moon', type: 'toggle', size: 'c1r1' },
        flashlight: { name: 'Flashlight', icon: 'fa-bolt', type: 'toggle', size: 'c1r1', warn: true },
        focus: { name: 'Focus', sub: 'Off', icon: 'fa-moon', type: 'toggle', size: 'c2r1' },
        hotspot: { name: 'Hotspot', sub: 'Off', icon: 'fa-wifi', type: 'toggle', size: 'c2r1' },
        game: { name: 'Game Mode', sub: 'Off', icon: 'fa-gamepad', type: 'toggle', size: 'c2r1' },
        power: { name: 'Power off', icon: 'fa-power-off', type: 'action', size: 'c2r1' },
        wallet: { name: 'Wallet', icon: 'fa-wallet', type: 'action', size: 'c1r1' },
        calculator: { name: 'Calculator', icon: 'fa-calculator', type: 'action', size: 'c1r1' },
        scan: { name: 'Scan', icon: 'fa-qrcode', type: 'action', size: 'c1r1' },
        speed: { name: 'Speed up', icon: 'fa-bolt', type: 'action', size: 'c1r1' },
        camera: { name: 'Camera', icon: 'fa-camera', type: 'action', size: 'c1r1' },
        music: { name: 'Music', icon: 'fa-music', type: 'widget', size: 'c4r2', frame: 'widgets/music-control.htm', srcdoc: musicWidgetHtml },
        brightness: { name: 'Brightness', icon: 'fa-sun', top: 'fa-circle-half-stroke', type: 'slider', size: 'c1r2', value: 78 },
        volume: { name: 'Volume', icon: 'fa-volume-high', top: 'fa-music', type: 'slider', size: 'c1r2', value: 45 }
    };

    const state = {
        edit: false,
        active: [
            { id: 'wifi', on: true, size: 'c2r1' },
            { id: 'bluetooth', on: true, size: 'c2r1' },
            { id: 'brightness', on: true, size: 'c1r2', value: 78 },
            { id: 'volume', on: true, size: 'c1r2', value: 45 },
            { id: 'flashlight', on: false, size: 'c1r1' },
            { id: 'darkmode', on: false, size: 'c1r1' },
            { id: 'battery', on: false, size: 'c2r2' }
        ],
        available: ['airplane', 'rotation', 'location', 'focus', 'hotspot', 'game', 'power', 'wallet', 'calculator', 'scan', 'speed', 'camera', 'music']
    };

    const activeGrid = document.getElementById('active-grid');
    const availableGrid = document.getElementById('available-grid');
    const editButton = document.getElementById('cc-edit-btn');
    const settingsButton = document.getElementById('cc-settings-btn');
    const expandedShade = document.getElementById('shade-expanded');
    const editHint = document.getElementById('cc-hint');

    const sizeClass = (size) => {
        const match = size.match(/c(\d)r(\d)/);
        return `cc${match[1]} rr${match[2]}`;
    };

    const parseSize = (size) => {
        const match = size.match(/c(\d)r(\d)/);
        return { columns: Number(match[1]), rows: Number(match[2]) };
    };

    const controlIcon = (control) => `<i class="${control.brand ? 'fab' : 'fas'} ${control.icon}"></i>`;

    function canPlace(item, x, y, ignoredId) {
        const size = parseSize(item.size);
        return x >= 0 && y >= 0 && x + size.columns <= 4 && !state.active.some((other) => {
            if (other.id === ignoredId || other.x == null || other.y == null) {
                return false;
            }
            const otherSize = parseSize(other.size);
            return x < other.x + otherSize.columns && x + size.columns > other.x
                && y < other.y + otherSize.rows && y + size.rows > other.y;
        });
    }

    function fitsPlaced(item, x, y, placed) {
        const size = parseSize(item.size);
        return x >= 0 && y >= 0 && x + size.columns <= 4 && !placed.some((other) => {
            const otherSize = parseSize(other.item.size);
            return x < other.x + otherSize.columns && x + size.columns > other.x
                && y < other.y + otherSize.rows && y + size.rows > other.y;
        });
    }

    function reflowAround(anchor, x, y) {
        const originals = state.active.map((item) => ({ item, x: item.x, y: item.y }));
        const placed = [{ item: anchor, x, y }];
        anchor.x = x;
        anchor.y = y;

        for (const item of state.active) {
            if (item === anchor) {
                continue;
            }

            const original = originals.find((value) => value.item === item);
            let bestPosition = null;
            const size = parseSize(item.size);

            for (let row = 0; row < 12; row += 1) {
                for (let column = 0; column <= 4 - size.columns; column += 1) {
                    if (fitsPlaced(item, column, row, placed)) {
                        const distance = Math.abs(column - original.x) + Math.abs(row - original.y);
                        if (!bestPosition || distance < bestPosition.distance) {
                            bestPosition = { x: column, y: row, distance };
                        }
                    }
                }
            }

            if (!bestPosition) {
                originals.forEach((value) => {
                    value.item.x = value.x;
                    value.item.y = value.y;
                });
                return false;
            }

            item.x = bestPosition.x;
            item.y = bestPosition.y;
            placed.push({ item, x: bestPosition.x, y: bestPosition.y });
        }

        return true;
    }

    function ensureLayout() {
        state.active.forEach((item) => {
            if (canPlace(item, item.x ?? -1, item.y ?? -1, item.id)) {
                return;
            }

            const size = parseSize(item.size);
            for (let row = 0; row < 12; row += 1) {
                let placed = false;
                for (let column = 0; column <= 4 - size.columns; column += 1) {
                    if (canPlace(item, column, row, item.id)) {
                        item.x = column;
                        item.y = row;
                        placed = true;
                        break;
                    }
                }
                if (placed) {
                    break;
                }
            }
        });
    }

    function render() {
        document.querySelectorAll('.cc-dragging').forEach((element) => element.remove());
        ensureLayout();
        activeGrid.innerHTML = '';
        availableGrid.innerHTML = '';
        state.active.forEach((item) => activeGrid.appendChild(createTile(item)));
        state.available.forEach((id) => availableGrid.appendChild(createAvailableTile(id)));
    }

    function createTile(item) {
        const control = masterControls[item.id];
        const tile = document.createElement('div');
        const size = parseSize(item.size);
        tile.className = `cc-tile ${sizeClass(item.size)} ${control.type === 'widget' ? 'cc-widget-tile' : ''}${control.type === 'slider' ? 'cc-slider' : ''}${item.on && control.type !== 'slider' ? ' on' : ''}${control.warn ? ' warn-tile' : ''}`;
        tile.dataset.id = item.id;
        tile.style.gridColumn = `${item.x + 1} / span ${size.columns}`;
        tile.style.gridRow = `${item.y + 1} / span ${size.rows}`;

        if (state.edit) {
            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'cc-badge cc-remove';
            removeButton.setAttribute('aria-label', `Remove ${control.name}`);
            removeButton.title = `Remove ${control.name}`;
            removeButton.innerHTML = '<i class="fas fa-minus"></i>';
            removeButton.onclick = (event) => {
                event.stopPropagation();
                removeItem(item.id);
            };
            tile.appendChild(removeButton);

            const resizeButton = document.createElement('button');
            resizeButton.type = 'button';
            resizeButton.className = 'cc-resize';
            resizeButton.setAttribute('aria-label', `Resize ${control.name}`);
            resizeButton.title = `Resize ${control.name}`;
            resizeButton.onpointerdown = (event) => startResize(event, tile, item);
            tile.appendChild(resizeButton);
            tile.onpointerdown = (event) => {
                if (!event.target.closest('.cc-badge, .cc-resize')) {
                    startDrag(event, tile);
                }
            };
        }

        if (control.type === 'widget') {
            const frame = document.createElement('iframe');
            frame.className = 'cc-widget-frame';
            frame.src = control.srcdoc ? '' : control.frame;
            if (control.srcdoc) {
                frame.srcdoc = control.srcdoc;
            }
            frame.title = control.name;
            frame.setAttribute('sandbox', 'allow-scripts');
            tile.appendChild(frame);
            return tile;
        }

        if (control.type === 'slider') {
            addSlider(tile, item, control);
        } else {
            const dot = document.createElement('div');
            dot.className = 'cc-dot';
            dot.innerHTML = controlIcon(control);
            tile.appendChild(dot);

            const label = document.createElement('div');
            label.className = 'cc-label-wrap';
            label.innerHTML = `<div class="cc-label">${control.name}</div>${control.sub ? `<div class="cc-sub">${item.on ? control.sub : 'Off'}</div>` : ''}`;
            tile.appendChild(label);
            tile.onclick = () => {
                if (state.edit) {
                    return;
                }
                if (control.type === 'action') {
                    tile.classList.add('on');
                    setTimeout(() => tile.classList.remove('on'), 250);
                } else {
                    item.on = !item.on;
                    render();
                }
            };
        }

        return tile;
    }

    function addSlider(tile, item, control) {
        tile.querySelectorAll('.cc-fill, .cc-slider-icon').forEach((element) => element.remove());
        const size = parseSize(item.size);
        const vertical = size.rows > size.columns;
        const fill = document.createElement('div');
        fill.className = `cc-fill ${vertical ? '' : 'horizontal'}`;
        fill.style[vertical ? 'height' : 'width'] = `${item.value ?? control.value}%`;
        tile.appendChild(fill);
        tile.insertAdjacentHTML('beforeend', `<div class="cc-slider-icon ${vertical ? 'cc-pos-bottom' : 'cc-pos-start'}">${controlIcon(control)}</div><div class="cc-slider-icon ${vertical ? 'cc-pos-top' : 'cc-pos-end'}"><i class="fas ${control.top}"></i></div>`);

        const setValue = (event) => {
            const rect = tile.getBoundingClientRect();
            const percentage = vertical
                ? 1 - (event.clientY - rect.top) / rect.height
                : (event.clientX - rect.left) / rect.width;
            item.value = Math.round(Math.max(0, Math.min(1, percentage)) * 100);
            fill.style[vertical ? 'height' : 'width'] = `${item.value}%`;
        };

        let adjusting = false;
        tile.onpointerdown = (event) => {
            if (state.edit) {
                if (!event.target.closest('.cc-resize, .cc-badge')) {
                    startDrag(event, tile);
                }
                return;
            }
            adjusting = true;
            setValue(event);
            try {
                tile.setPointerCapture(event.pointerId);
            } catch (error) {
            }
        };
        tile.onpointermove = (event) => adjusting && setValue(event);
        tile.onpointerup = () => { adjusting = false; };
    }

    function createAvailableTile(id) {
        const control = masterControls[id];
        const tile = document.createElement('div');
        tile.className = 'cc-tile cc1 rr1';
        tile.innerHTML = `<button type="button" class="cc-badge cc-add" aria-label="Add ${control.name}" title="Add ${control.name}"><i class="fas fa-plus"></i></button><div class="cc-dot">${controlIcon(control)}</div><div class="cc-label">${control.name}</div>`;
        tile.querySelector('.cc-add').onclick = (event) => {
            event.stopPropagation();
            addItem(id);
        };
        tile.onclick = (event) => {
            if (!event.target.closest('button')) {
                addItem(id);
            }
        };
        return tile;
    }

    function addItem(id) {
        state.available = state.available.filter((availableId) => availableId !== id);
        state.active.push({ id, on: false, size: masterControls[id].size, value: masterControls[id].value });
        render();
    }

    function removeItem(id) {
        state.active = state.active.filter((item) => item.id !== id);
        if (!state.available.includes(id)) {
            state.available.push(id);
        }
        render();
    }

    let drag = null;
    let placeholder = null;
    let offsetX = 0;
    let offsetY = 0;
    let dragGrid = null;
    let dragCell = null;

    function gridMetrics() {
        const rect = activeGrid.getBoundingClientRect();
        const styles = getComputedStyle(activeGrid);
        const gap = parseFloat(styles.gap) || 0;
        const paddingLeft = parseFloat(styles.paddingLeft) || 0;
        const paddingTop = parseFloat(styles.paddingTop) || 0;
        const paddingRight = parseFloat(styles.paddingRight) || 0;
        return {
            left: rect.left + paddingLeft,
            top: rect.top + paddingTop,
            cellWidth: (rect.width - paddingLeft - paddingRight - gap * 3) / 4,
            cellHeight: parseFloat(styles.gridAutoRows) || 64,
            gap
        };
    }

    function startDrag(event, tile) {
        if (!state.edit || event.button === 2) {
            return;
        }
        event.preventDefault();
        const rect = tile.getBoundingClientRect();
        const item = state.active.find((value) => value.id === tile.dataset.id);
        drag = tile;
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;
        dragGrid = gridMetrics();
        dragCell = { x: item.x, y: item.y };
        placeholder = document.createElement('div');
        placeholder.className = `${tile.className} cc-placeholder`;
        placeholder.style.gridColumn = tile.style.gridColumn;
        placeholder.style.gridRow = tile.style.gridRow;
        tile.parentNode.insertBefore(placeholder, tile);
        document.body.appendChild(tile);
        tile.classList.add('cc-dragging');
        tile.style.width = `${rect.width}px`;
        tile.style.height = `${rect.height}px`;
        tile.setPointerCapture?.(event.pointerId);
        moveDrag(event);
        document.addEventListener('pointermove', moveDrag);
        document.addEventListener('pointerup', endDrag, { once: true });
        document.addEventListener('pointercancel', cancelDrag, { once: true });
    }

    function moveDrag(event) {
        if (!drag) {
            return;
        }
        const item = state.active.find((value) => value.id === drag.dataset.id);
        const size = parseSize(item.size);
        const x = Math.max(0, Math.min(4 - size.columns, Math.floor((event.clientX - offsetX - dragGrid.left) / (dragGrid.cellWidth + dragGrid.gap))));
        const y = Math.max(0, Math.floor((event.clientY - offsetY - dragGrid.top) / (dragGrid.cellHeight + dragGrid.gap)));
        drag.style.left = `${event.clientX - offsetX}px`;
        drag.style.top = `${event.clientY - offsetY}px`;
        dragCell = { x, y };
        placeholder.classList.remove('cc-invalid');
        placeholder.style.gridColumn = `${x + 1} / span ${size.columns}`;
        placeholder.style.gridRow = `${y + 1} / span ${size.rows}`;
    }

    function endDrag() {
        document.removeEventListener('pointermove', moveDrag);
        document.removeEventListener('pointercancel', cancelDrag);
        if (!drag) {
            return;
        }
        const item = state.active.find((value) => value.id === drag.dataset.id);
        reflowAround(item, dragCell.x, dragCell.y);
        drag.remove();
        placeholder.remove();
        drag = null;
        placeholder = null;
        render();
    }

    function cancelDrag() {
        document.removeEventListener('pointermove', moveDrag);
        if (!drag) {
            return;
        }
        drag.remove();
        placeholder?.remove();
        drag = null;
        placeholder = null;
        render();
    }

    let resizing = null;
    let startRect = null;
    let startPoint = null;
    let resizeOrigin = null;

    function startResize(event, tile, item) {
        if (!state.edit) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        resizing = { tile, item };
        startRect = tile.getBoundingClientRect();
        startPoint = { x: event.clientX, y: event.clientY };
        resizeOrigin = parseSize(item.size);
        try {
            event.currentTarget.setPointerCapture?.(event.pointerId);
        } catch (error) {
        }
        document.addEventListener('pointermove', resizeMove);
        document.addEventListener('pointerup', resizeEnd, { once: true });
    }

    function resizeMove(event) {
        if (!resizing) {
            return;
        }
        const dx = event.clientX - startPoint.x;
        const dy = event.clientY - startPoint.y;
        const gridRect = activeGrid.getBoundingClientRect();
        const styles = getComputedStyle(activeGrid);
        const gap = parseFloat(styles.gap) || 0;
        const cellWidth = (gridRect.width - gap * 3) / 4;
        const cellHeight = parseFloat(styles.gridAutoRows) || 64;
        const columns = Math.max(1, Math.min(4, resizeOrigin.columns + Math.round(dx / (cellWidth + gap))));
        const rows = Math.max(1, Math.min(4, resizeOrigin.rows + Math.round(dy / (cellHeight + gap))));

        const nextSize = `c${columns}r${rows}`;
        if (nextSize === resizing.item.size) {
            return;
        }
        const previousSize = resizing.item.size;
        const previousPositions = state.active.map((item) => ({ item, x: item.x, y: item.y }));
        resizing.item.size = nextSize;
        if (!reflowAround(resizing.item, resizing.item.x, resizing.item.y)) {
            resizing.item.size = previousSize;
            previousPositions.forEach((position) => {
                position.item.x = position.x;
                position.item.y = position.y;
            });
            return;
        }
        resizing.tile.className = resizing.tile.className.replace(/cc[1-4] rr[1-4]/, sizeClass(nextSize));
        resizing.tile.style.gridColumn = `${resizing.item.x + 1} / span ${columns}`;
        resizing.tile.style.gridRow = `${resizing.item.y + 1} / span ${rows}`;
        if (masterControls[resizing.item.id].type === 'slider') {
            addSlider(resizing.tile, resizing.item, masterControls[resizing.item.id]);
        }
    }

    function resizeEnd() {
        document.removeEventListener('pointermove', resizeMove);
        resizing = null;
        render();
    }

    editButton.onclick = () => {
        state.edit = !state.edit;
        editingPanel = state.edit;
        expandedShade.classList.toggle('cc-edit', state.edit);
        editButton.classList.toggle('active-edit', state.edit);
        editButton.innerHTML = state.edit ? '<i class="fas fa-check"></i>' : '<i class="fas fa-pencil-alt"></i>';
        editHint.textContent = state.edit ? 'Drag to reorder · use the corner handle to resize' : 'Tap controls · Edit to customize';
        render();
    };

    settingsButton.onclick = () => {
        if (typeof openApp === 'function') {
            expandedShade.classList.remove('cc-edit');
            state.edit = false;
            openApp('settings');
        }
    };

    window.addEventListener('blur', cancelDrag);
    render();
})();
