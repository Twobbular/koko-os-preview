const drawer = document.getElementById('appDrawer');
let infoPopup = document.getElementById('infopopup');
const feedList = infoPopup.querySelector('.feed-list');
const feedStatus = infoPopup.querySelector('.feed-status');
const feedWindow = infoPopup.querySelector('.feed-window');
let feedSwipe = null;
infoPopup.querySelector('.feed-close').addEventListener('click', () => {
    infoPopup.classList.remove('open');
});
feedWindow.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.stopPropagation();
    feedSwipe = { x: event.clientX, y: event.clientY, horizontal: false };
});
feedWindow.addEventListener('pointermove', (event) => {
    if (!feedSwipe) return;
    const dx = event.clientX - feedSwipe.x;
    const dy = event.clientY - feedSwipe.y;
    if (!feedSwipe.horizontal && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        feedSwipe.horizontal = true;
        feedWindow.style.transition = 'none';
        try {
            feedWindow.setPointerCapture?.(event.pointerId);
        } catch (error) {
        }
    }
    if (!feedSwipe.horizontal) return;
    event.stopPropagation();
    event.preventDefault();
    const offset = Math.max(-window.innerWidth, Math.min(window.innerWidth, dx));
    feedWindow.style.transform = `translateX(${offset}px)`;
    feedWindow.style.opacity = `${Math.max(0.2, 1 - Math.abs(offset) / window.innerWidth)}`;
});
function finishFeedSwipe(event) {
    if (!feedSwipe?.horizontal) {
        feedSwipe = null;
        return;
    }
    event.stopPropagation();
    const dx = event.clientX - feedSwipe.x;
    const dismiss = Math.abs(dx) > window.innerWidth * 0.2;
    feedWindow.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
    feedWindow.style.transform = dismiss ? `translateX(${dx < 0 ? '-100%' : '100%'})` : '';
    feedWindow.style.opacity = dismiss ? '0' : '';
    if (dismiss) {
        setTimeout(() => {
            infoPopup.classList.remove('open');
            feedWindow.style.transform = '';
            feedWindow.style.opacity = '';
        }, 250);
    }
    feedSwipe = null;
}
document.addEventListener('pointerup', finishFeedSwipe);
document.addEventListener('pointercancel', () => { feedSwipe = null; });
function closeShade() { shade.classList.remove('open'); }
function closeDrawer() { drawer.classList.remove('open'); document.getElementById('appDrawer').style.transform='translateY(100%)'}

function toggleShadeState() {
    const shadeCompact = document.getElementById('shade-compact');
    const shadeExpanded = document.getElementById('shade-expanded');
    
    if (shadeState === 'compact') {
        // Switch to expanded
        shadeState = 'expanded';
        shadeCompact.classList.remove('active');
        shadeExpanded.classList.add('active');
    } else {
        // Switch to compact
        shadeState = 'compact';
        shadeExpanded.classList.remove('active');
        shadeCompact.classList.add('active');
    }
}

function updateRootVars() {
    const root = document.documentElement;
    const w = window.innerWidth;
    const h = window.innerHeight;

    const cols = w > 600 ? 5 : 4; // more columns on bigger screens
    const rows = h > 800 ? 6 : 5; 
    root.style.setProperty('--grid-cols', cols);
    root.style.setProperty('--grid-rows', rows);
}

// Run on load
//updateRootVars();

// Update on resize
//window.addEventListener('resize', updateRootVars);


function openInfo(type) {
    let contentHTML = '';
    const entries = info[type] || {};
    for(let index in entries){
        const item = entries[index];
        const iconHTML = item.icon.includes('fa-') ? `<i class="fas ${item.icon}"></i>` : `<img src="${item.icon}" />`;
        contentHTML += `
        <a href="${item.url}" class="news">
            <div class="news-header">${iconHTML}<div class="news-title">${item.title}</div></div>
            <div class="news-content">${item.content}</div>
            <img class="news-preview" src="${item.thumbnail}" />
        </a>`;
    }
    feedList.innerHTML = contentHTML || '<p class="feed-empty">No stories are available right now.</p>';
    feedStatus.textContent = contentHTML ? `${Object.keys(entries).length} stories` : 'Feed unavailable';
    feedWindow.style.transform = '';
    feedWindow.style.opacity = '';
    feedWindow.style.transition = '';
    infoPopup.classList.add('open');
}

/* =========================================
   5. FOLDER MODAL
   ========================================= */
const folderModal = document.getElementById('folderModal');
const folderPages = document.getElementById('folderPages');
const folderDots = document.getElementById('folderDots');
const folderPager = document.getElementById('folderPager');

let currentFolderPage = 0;
const ITEMS_PER_PAGE = 12; // 3 columns x 4 rows

function openFolder(folderData, isRefresh = false) {
    if(!isRefresh) {
        let found = false;
        
        // search pages
        pages.forEach((p, pIdx) => {
            p.forEach((item, iIdx) => {
                if(item === folderData) {
                    currentOpenFolder = { p: pIdx, i: iIdx, loc: 'page' };
                    found = true;
                }
            });
        });

        // search dock
        if (!found) {
            dock.forEach((item, iIdx) => {
                if(item === folderData) {
                    currentOpenFolder = { p: -1, i: iIdx, loc: 'dock' };
                    found = true;
                }
            });
        }

        if(!found) return;
    }

    // Reset to first page
    currentFolderPage = 0;
    folderPages.innerHTML = '';
    folderDots.innerHTML = '';
    
    // Calculate number of pages needed
    const totalItems = folderData.apps.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    
    // Create pages
    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
        const page = document.createElement('div');
        page.className = 'folder-page';
        
        const startIdx = pageIdx * ITEMS_PER_PAGE;
        const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, totalItems);
        
        for (let i = startIdx; i < endIdx; i++) {
            const appId = folderData.apps[i];
            const slot = document.createElement('div');
            slot.className = 'app-slot';
            slot.dataset.loc = 'folder';
            slot.dataset.i = i;
            slot.dataset.p = currentOpenFolder.p;
            
            const appIcon = createIcon(appId);
            slot.appendChild(appIcon);
            addDragEvents(slot);
            
            page.appendChild(slot);
        }
        
        folderPages.appendChild(page);
    }
    
    // Create pagination dots
    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('div');
        dot.className = `folder-dot ${i === 0 ? 'active' : ''}`;
        dot.onclick = () => goToFolderPage(i);
        folderDots.appendChild(dot);
    }
    
    if(!isRefresh) folderModal.classList.add('open');
}

function goToFolderPage(pageIdx) {
    currentFolderPage = pageIdx;
    const offset = pageIdx * 100;
    folderPages.style.transform = `translateX(-${offset}%)`;
    
    // Update dots
    document.querySelectorAll('.folder-dot').forEach((dot, idx) => {
        dot.classList.toggle('active', idx === pageIdx);
    });
}

folderModal.onclick = (e) => {
    if(e.target === folderModal) folderModal.classList.remove('open');
}


setInterval(() => {
    const d = new Date();
    document.getElementById('clockTime').innerText = 
        d.getHours() + ':' + String(d.getMinutes()).padStart(2,'0');
}, 1000);

render();

// Source - https://stackoverflow.com/a
// Posted by Walid Ajaj
// Retrieved 2026-01-15, License - CC BY-SA 3.0

/*document.addEventListener("dragstart", function( event ) {
    var img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    event.dataTransfer.setDragImage(img, 0, 0);
}, false);
*/

window.onerror = function (message, url, lineNo, columnNo, error) {
    alert("Error: " + message + "\nURL: " + url + "\nLine: " + lineNo);
    // Returning true prevents the default browser error handling (e.g., logging to the console)
    return true; 
};

// Example of an uncaught error
//nonExistentFunction(); // This will trigger the window.onerror handler
