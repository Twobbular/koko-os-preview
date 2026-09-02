const screen = document.getElementById('mainScreen');
const appsbar = document.querySelector('.appsbar');
const hammer = new Hammer(screen);

hammer.get('pan').set({
    direction: Hammer.DIRECTION_ALL,
    threshold: 5 
});
openAppFunc=openApp
//console.log(openApp)

// ---------- CONFIG & STATE ----------
const SETTINGS_TRIGGER_ZONE = 0.10; // Top 10%
const DRAWER_TRIGGER_ZONE = 0.80;   // Bottom 15%
const PREVIEW_TRIGGER_ZONE = 0.92;  // Very bottom 5% (Home Bar area)
const FLICK_VELOCITY = 0.4;         
const PAGE_SWIPE_RATIO = 0.3;       // Fraction of screen width needed to change page

let activeGesture = null; 
let activeApp = null;
let rafPending = false;
let currentDeltaY = 0;
let currentDeltaX = 0;
let shadeState = 'compact'; // 'compact' or 'expanded'
let shadeIsMoving = false; // Prevent shade re-triggering
let appOpen=false;

const shade = document.getElementById('notifShade');
const appDrawer = document.getElementById('appDrawer');
const backSwipeIndicator = document.getElementById('back-swipe-indicator');
// Assuming infoPopup is defined globally elsewhere as in your previous snippets
const noAppOpen = () => !document.querySelector('#appFrame.open');
const isShadeOpen = () => shade.classList.contains('open');

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// iOS-style rubber banding
function rubberBand(distance, dimension, resistance = 0.55) {
    return (distance * dimension * resistance) / (dimension + resistance * distance);
}

// Mirrors the math in rendering.js's animateBackground(), but computed
// on-demand (no animation) so we can drag the wallpaper in real time.
// Relies on bgImage / getCoverSize / getPageCount / screenEl from rendering.js.
function getLivePixelsPerPage() {
    if (typeof bgImage === 'undefined' || !bgImage.loaded) return 0;

    const vw = screenEl.clientWidth;
    const vh = screenEl.clientHeight;
    const cover = getCoverSize(bgImage.width, bgImage.height, vw, vh);

    const maxIndex = Math.max(1, getPageCount() - 1);
    const bgExtra = Math.max(0, cover.width - vw);
    const pageScrollWidth = maxIndex * vw;
    const totalTravel = Math.min(bgExtra, pageScrollWidth);

    return totalTravel / maxIndex;
}


// ---------- PAN START ----------
hammer.on('panstart', (e) => {
    if (isDragging || shadeIsMoving || isDraggingAW) return;
    console.log(isDraggingAW)

    // Use screen container rect for accurate positioning
    const screenRect = screen.getBoundingClientRect();
    const centerY = screenRect.top + screenRect.height / 2;
    const relativeY = e.center.y - screenRect.top;
    const yRatio = relativeY / screenRect.height;
    const xRatio = (e.center.x - screenRect.left) / screenRect.width;
    console.log(xRatio)
    
    const openApp = document.querySelector('#appFrame.open');
    
    // IMPORTANT: Disable pointer-events on app in gesture zones so Hammer gets the events
    // Re-enable it for the middle content area
    if (openApp) {
        if (yRatio < SETTINGS_TRIGGER_ZONE || yRatio > DRAWER_TRIGGER_ZONE) {
            openApp.style.pointerEvents = 'none';
        } else {
            openApp.style.pointerEvents = 'auto';
        }
    }

    activeGesture = null;
    activeApp = null;
    currentDeltaY = 0;
    currentDeltaX = 0;

    if (openApp && xRatio < 0.16 && !editingPanel) {
        activeGesture = 'app_back';
        activeApp = openApp;
        activeApp.style.transition = 'none';
        backSwipeIndicator.classList.add('visible');
        return;
    }

    // 1. SHADE INTERACTION (Toggle or Close)
    if (isShadeOpen() && !editingPanel) {
        // Tile editing owns the pointer while the expanded control center is in edit mode.
        if (document.getElementById('shade-expanded').classList.contains('cc-edit')) {
            return;
        }
        // If pulling from top and shade is open, toggle between compact and expanded
        if (yRatio < SETTINGS_TRIGGER_ZONE) {
            activeGesture = 'shade_toggle';
            shadeIsMoving = true;
            shade.style.transition = 'none';
        } else {
            // Otherwise close the shade
            activeGesture = 'shade_close';
            shadeIsMoving = true;
            shade.style.transition = 'none';
        }
        return;
    }

    // 2. OPEN SHADE (Top) - Works even when app is open
    if (yRatio < SETTINGS_TRIGGER_ZONE  && !editingPanel) {
        // Reset to compact state when opening shade
        shadeState = 'compact';
        document.getElementById('shade-compact').classList.add('active');
        document.getElementById('shade-expanded').classList.remove('active');
        
        activeGesture = 'shade_open';
        shadeIsMoving = true;
        shade.style.transition = 'none';
        return;
    }
    
    // 3. APP GESTURES (Close App)
    if (openApp && yRatio > DRAWER_TRIGGER_ZONE && !editingPanel) {
    if (xRatio > 0.92 && false) { //made impossible for now
        activeGesture = 'split_open';
        splitApp = openApp;
        splitApp.classList.add('is-dragging');
        splitApp.style.transition = 'none';
        return;
    } else {
        activeGesture = 'app_close';
        activeApp = openApp;
        activeApp.classList.add('is-dragging');
        activeApp.style.transition = 'none';
        return;
    }
}


    // 4. HOME SCREEN BOTTOM GESTURES
    if (noAppOpen() && yRatio > DRAWER_TRIGGER_ZONE && !editingPanel) {
        // If swipe starts at the very bottom edge, trigger Previews
        if (yRatio > PREVIEW_TRIGGER_ZONE) {
            activeGesture = 'preview_open';
        } else {
            activeGesture = 'drawer_open';
            appDrawer.style.transition = 'none';
        }
        return;
    }

    // 5. HOME SCREEN PAGE SWIPE (live-tracked, follows the finger)
    // Only takes over on the home screen, when there's no app open and no
    // folder overlay to navigate instead (folder paging stays on the
    // discrete swipeleft/swiperight recognizer below).
    if (noAppOpen() && !folderModal.classList.contains('open') && !isShadeOpen() && !isDraggingAW && !infoPopup.classList.contains('open') && !appDrawer.classList.contains('open')) {
        activeGesture = 'page_swipe';
        slider.style.transition = 'none';
        return;
    }
});

hammer.on('swipeup', (e) => {
    alert('bruh')
    if(e.pointer===3){ 
        alert('screenshot')
    } else if (infoPopup.classList.contains('open')){
        //infoPopup.classList.remove('open');
    }
})
// ---------- PAN MOVE ----------
hammer.on('panmove', (e) => {
    if (!activeGesture || isDragging || isDraggingAW) return;    console.log(isDraggingAW)
    
    // Ensure deltaY/deltaX are numbers and handle properly
    currentDeltaY = e.deltaY || 0;
    currentDeltaX = e.deltaX || 0;

    if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(handleDragFrame);
    }
});

// ---------- ANIMATION FRAME ----------
function handleDragFrame() {
    rafPending = false;

    const screenH = window.innerHeight;
    const screenW = window.innerWidth;
    const maxPull = screenH * 0.9;

    switch (activeGesture) {

        /* ================= SHADE OPEN ================= */
        case 'shade_open': {
            if(infoPopup.classList.contains('open')){
                infoPopup.classList.remove('open');
                return;
            }
            if (currentDeltaY <= 0) return;

            const pull = rubberBand(currentDeltaY, screenH);
            const progress = clamp(pull / (screenH * 0.6), 0, 1);

            shade.style.transform = `translateY(${(-100 + progress * 100)}%)`;
            shade.style.opacity = 0.6 + progress * 0.4;
            break;
        }

        /* ================= SHADE CLOSE ================= */
        case 'shade_close': {
            if (currentDeltaY >= 0) return;

            const pull = rubberBand(Math.abs(currentDeltaY), screenH);
            const progress = clamp(pull / (screenH * 0.6), 0, 1);

            shade.style.transform = `translateY(${-progress * 100}%)`;
            shade.style.opacity = 1 - progress * 0.4;
            break;
        }

        /* ================= SHADE TOGGLE ================= */
        case 'shade_toggle': {
            const pull = clamp(currentDeltaY, -120, 120);
            shade.style.transform = `translateY(${pull * 0.2}px)`;
            break;
        }

        /* ================= DRAWER ================= */
        case 'drawer_open': {
            if (currentDeltaY >= 0) return;

            const pull = rubberBand(Math.abs(currentDeltaY), screenH);
            appDrawer.style.transform = `translateY(calc(100% - ${pull}px))`;
            break;
        }

        /* ================= PREVIEW ================= */
        case 'preview_open': {
            if (currentDeltaY >= 0) return;

            const progress = clamp(Math.abs(currentDeltaY) / 240, 0, 1);
            screen.style.transform = `scale(${1 - progress * 0.07})`;
            //screen.style.borderRadius = `${progress * 28}px`;
            appsbar.style.transform =
              `translateY(${-progress * 15}px) translateX(-50%)`;
            break;
        }

        /* ================= APP CLOSE ================= */
        case 'app_close': {
            if (currentDeltaY >= 0) return;

            const pull = rubberBand(Math.abs(currentDeltaY), screenH);
            const progress = clamp(pull / (screenH * 0.5), 0, 1);

            activeApp.style.transform =
                `translateY(${-pull * 0.6}px) scale(${1 - progress * 0.15})`;
            const t = clamp(pull / (screenH * 0.5), 0, 1);

            // smooth easing (no trig)
            const eased = 1 - Math.pow(1 - t, 3);

            appsbar.style.transform =
              `translateY(${-eased * 35}px) translateX(-50%)`;
            break;
        }

        case 'app_back': {
            const progress = clamp(Math.max(0, currentDeltaX) / (screenW * 0.35), 0, 1);
            backSwipeIndicator.style.transform = `translate(${progress * 18}px, -50%) scale(${0.86 + progress * 0.14})`;
            backSwipeIndicator.style.opacity = `${0.55 + progress * 0.45}`;
            activeApp.style.transform = `translateX(${Math.max(0, currentDeltaX) * 0.35}px)`;
            activeApp.style.opacity = `${1 - progress * 0.12}`;
            break;
        }

        /* ================= HOME PAGE SWIPE ================= */
        case 'page_swipe': {
            let dx = currentDeltaX;

            const atFirstPage = currentPage === 0;
            const atLastPage = currentPage === pages.length - 1;

            // Rubber-band past the first/last page instead of over-scrolling
            if (atFirstPage && dx > 0) {
                dx = rubberBand(dx, screenW);
            } else if (atLastPage && dx < 0) {
                dx = -rubberBand(Math.abs(dx), screenW);
            }

            const percent = (dx / screenW) * 100;
            slider.style.transform =
                `translateX(calc(-${currentPage * 100}% + ${percent}%))`;

            // Drag the wallpaper along with the page, in lockstep with the slider
            if (backgroundMove) {
                const pixelsPerPage = getLivePixelsPerPage();
                if (pixelsPerPage > 0) {
                    // A WAAPI animation from a previous page change would
                    // otherwise keep overriding our direct style below
                    if (bgAnim) {
                        bgAnim.cancel();
                        bgAnim = null;
                    }

                    const fraction = -dx / screenW; // matches page direction (swipe left => next page)
                    lastBgOffset = currentPage * pixelsPerPage + fraction * pixelsPerPage;
                    screenEl.style.backgroundPosition = `-${lastBgOffset}px center`;
                }
            }
            break;
        }
        /*case 'split_open': {
    if (currentDeltaY >= 0) return;

    const pull = rubberBand(Math.abs(currentDeltaY), screenH);
    splitProgress = clamp(pull / (screenH * 0.35), 0, 1);

    // Move app into top half
    splitApp.style.transform = `
        translateY(${-pull * 0.4}px)
        scale(${1 - splitProgress * 0.08})
    `;

    // Optional dim background
    screen.style.background = `rgba(0,0,0,${splitProgress * 0.15})`;
    break;
}*/

    }
}


// ---------- PAN END ----------
hammer.on('panend', (e) => {
    if (!activeGesture || isDragging || isDraggingAW) return;    console.log(isDraggingAW)

    const velocity = e.velocityY;
    const distance = Math.abs(e.deltaY);
    const screenH = window.innerHeight;
    const screenW = window.innerWidth;
    const absVelocity = Math.abs(velocity);
    const isFast = absVelocity > 0.45;

    
    // Reset screen styles if they were modified by preview gesture
    screen.style.transition = 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)';
    screen.style.transform = '';
    screen.style.borderRadius = '';

    shade.style.transition = 'transform 0.35s cubic-bezier(0.165, 0.84, 0.44, 1)';
    appDrawer.style.transition = 'transform 0.35s cubic-bezier(0.165, 0.84, 0.44, 1)';
    
    if (activeApp) {
        activeApp.style.transition = 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)';
        activeApp.classList.remove('is-dragging');
    }

    switch (activeGesture) {
        case 'shade_open':
            if(infoPopup.classList.contains('open')){
                infoPopup.classList.remove('open');
                break;
            }
            // Pulled down enough or flicked down → open
            if (currentDeltaY > screenH * 0.18 || velocity > FLICK_VELOCITY) {
                shade.classList.add('open');
                //shade.classList.add('active');
                shade.style.transform = 'translateY(0)';
                shade.style.opacity=1
            } else {
                shade.style.transform = 'translateY(-100%)';
                shade.classList.remove('open');
            }

            break;

        case 'shade_toggle':
            // Toggle between compact and expanded on drag
            if (Math.abs(currentDeltaY) > 60 || isFast) {
                shadeState = shadeState === 'compact' ? 'expanded' : 'compact';
                document.getElementById('shade-compact').classList.toggle('active', shadeState === 'compact');
                document.getElementById('shade-expanded').classList.toggle('active', shadeState === 'expanded');
            }
            //shade.style.transform = 'translateY(0)';
            shade.style.opacity=1

            shade.style.transform = 'translateY(0)';
            break;

        case 'shade_close':
            // Pulled up enough or flicked up → close
            if (Math.abs(currentDeltaY) > screenH * 0.18 || velocity < -FLICK_VELOCITY) {
                shade.classList.remove('open');
                shade.style.transform = 'translateY(-100%)';
            } else {
                shade.style.transform = 'translateY(0)';
            }

            break;

        case 'drawer_open':
            // Close info popup if open
            if(infoPopup.classList.contains('open')){
                infoPopup.classList.remove('open');
            }
            // Pull up (negative deltaY) opens drawer
            if (currentDeltaY < -screenH * 0.15 || velocity < -FLICK_VELOCITY) {
                appDrawer.classList.add('open');
                appDrawer.style.transform = 'translateY(0)';
            } else {
                appDrawer.style.transform = 'translateY(100%)';
            }

            break;

        case 'preview_open':
            // If swiped up enough, trigger the App Switcher
            if ((distance > 80) || velocity < -FLICK_VELOCITY) {
                if (typeof openAppPreviews === 'function') {
                    if(!infoPopup.classList.contains('open') && document.getElementById('multiappsarea').innerHTML.length > 0) openAppPreviews(); // && document.getElementById('multiappspreviewarea').innerHTML.length > 0
                    //if(document.getElementById('multiappspreviewarea').innerHTML.length > 0) return
                    infoPopup.classList.remove('open')
                    appsbar.style.transform = `translateY(0) translateX(-50%)`;
                }
            }
            break;

        case 'app_close':
            if (currentDeltaY < -screenH * 0.55 || velocity < -0.6) {
                closeApp(activeApp);
            } else if (currentDeltaY < -screenH * 0.05) {
                openAppPreviews();
                closeApp(activeApp);
            } else {
                resetAppStyles(activeApp);
            }
            appsbar.style.transform = `translateY(0) translateX(-50%)`;
            break;

        case 'app_back': {
            const passedThreshold = currentDeltaX > screenW * 0.2 || e.velocityX > FLICK_VELOCITY;
            backSwipeIndicator.classList.remove('visible');
            backSwipeIndicator.style.transform = '';
            backSwipeIndicator.style.opacity = '';
            if (passedThreshold) {
                closeApp(activeApp);
            } else {
                resetAppStyles(activeApp);
            }
            break;
        }

        case 'page_swipe': {
            const dx = currentDeltaX;
            const velX = e.velocityX;
            const passedThreshold = Math.abs(dx) > screenW * PAGE_SWIPE_RATIO;
            const isFastSwipe = Math.abs(velX) > FLICK_VELOCITY;

            let targetPage = currentPage;

            if (dx < 0 && (passedThreshold || (isFastSwipe && velX < 0))) {
                // Swiped left → next page (or dismiss info popup)
                if (infoPopup.classList.contains('open')) {
                    infoPopup.classList.remove('open');
                } else if (currentPage < pages.length - 1) {
                    targetPage = currentPage + 1;
                }
            } else if (dx > 0 && (passedThreshold || (isFastSwipe && velX > 0))) {
                // Swiped right → previous page (or dismiss / open info popup)
                if (infoPopup.classList.contains('open')) {
                    infoPopup.classList.remove('open');
                } else if (currentPage > 0) {
                    targetPage = currentPage - 1;
                } else if (currentPage === 0 && typeof openInfo === 'function') {
                    openInfo('news');
                }
            }

            // updatePageView sets its own transition + transform, so this
            // both snaps forward on a successful swipe and springs back
            // to the current page when the drag didn't clear the threshold.
            updatePageView(targetPage);
            break;
        }
        
        case 'split_open': {
            splitApp.style.transition = 'all 0.35s cubic-bezier(0.165, 0.84, 0.44, 1)';
            screen.style.transition = 'background 0.3s ease';

            if (currentDeltaY < -screenH * 0.22 || velocity < -0.6) {
                openSplitView(splitApp);
            } else {
                // Cancel
                splitApp.style.transform = '';
                screen.style.background = '';
            }
        
            splitApp.classList.remove('is-dragging');
            splitApp = null;
            break;
        }
        case 'split_close': {
            document.querySelector('.bottom-menu').classList.remove('open');
            break;
        }

    }

    activeGesture = null;
    rafPending = false;
    shadeIsMoving = false;
    
    // Restore pointer-events to auto for app frame after gesture ends
    const openApp = document.querySelector('#appFrame.open');
    if (openApp) {
        openApp.style.pointerEvents = 'auto';
    }
});

// (Keep your swipeleft/swiperight and helpers as they were)
// ---------- HORIZONTAL SWIPES (Folder paging & app switching) ----------
// NOTE: Home-screen page navigation used to live here, but it's now handled
// by the live-tracked 'page_swipe' gesture above (see panstart/panmove/panend),
// so it's been removed from this handler to avoid double-advancing pages.
// Folder paging and switching between open apps still use this discrete
// swipe recognizer since they aren't (yet) drag-tracked.
hammer.on('swipeleft swiperight', (e) => {
    
    if (activeGesture || isDragging || isShadeOpen()  || isDraggingAW) return;

    const screenRect = screen.getBoundingClientRect();
    const centerY = screenRect.top + screenRect.height / 2;
    const relativeY = e.center.y - screenRect.top;
    const yRatio = relativeY / screenRect.height;
    console.log(yRatio)
    console.log(e)
    console.log(relativeY)
    console.log(centerY)
    
    // Temporarily disable pointer-events on app to allow swipe through
    const openAppEl = document.querySelector('#appFrame.open');
    if (openAppEl) {
        openAppEl.style.pointerEvents = 'none';
        setTimeout(() => {
            openAppEl.style.pointerEvents = 'auto';
        }, 100);
    }
    
    // Prevent swipes if drawer is open
    //if (appDrawer.classList.contains('open')) return;

    if (e.type === 'swipeleft') {
        console.log('l')
        
        // Check if folder is open and allow page navigation within folder
        if (folderModal.classList.contains('open')) {
            const totalDots = document.querySelectorAll('.folder-dot').length;
            if (currentFolderPage < totalDots - 1) {
                goToFolderPage(currentFolderPage + 1);
            }
            return;
        }

        if(!noAppOpen()) {
            // Swipe through apps
            if(centerY <= 1000 || yRatio <= 0.75 ){
                const area = document.getElementById('multiappsarea');
                const frames = Array.from(area.getElementsByClassName('all-apps'));
                const currentIndex = frames.indexOf(openAppEl);

                if (currentIndex !== -1 && currentIndex - 1 >= 0) {
                    const nextApp = frames[currentIndex + 1];
                    closeApp(openAppEl);
                    console.log(nextApp.classList[0].toLocaleLowerCase())
                    openAppFunc(nextApp.classList[0].toLocaleLowerCase()); // use app id to open
                }
            }
            //alert('left')
        }
        // noAppOpen() case is now handled by the live 'page_swipe' gesture.
    } 
    else if (e.type === 'swiperight') {
        console.log('r')
        
        // Check if folder is open and allow page navigation within folder
        if (folderModal.classList.contains('open')) {
            if (currentFolderPage > 0) {
                goToFolderPage(currentFolderPage - 1);
            }
            return;
        }

        if(!noAppOpen()) {
            // Swipe through apps
            if(yRatio <= 0.75 || true){
                const area = document.getElementById('multiappsarea');
                const frames = Array.from(area.getElementsByClassName('all-apps'));
                const currentIndex = frames.indexOf(openAppEl);

                if (currentIndex !== -1 && currentIndex + 1 < frames.length) {
                    const prevApp = frames[currentIndex - 1];
                    closeApp(openAppEl);
                    console.log(prevApp.classList[0].toLocaleLowerCase())
                    openAppFunc(prevApp.classList[0].toLocaleLowerCase()); // use app id to open
                }
            }
            //alert('right')
        }
        // noAppOpen() case is now handled by the live 'page_swipe' gesture.
    }
});


// ---------- REUSED HELPERS ----------
function closeApp(app, isSplit = false) {
    if(isSplit){
        app=null;
        //document.querySelector('.bottom-menu').classList.remove('open');
        const splitAppFrame = document.getElementById('splitAppFrame');
        splitAppFrame.remove();
        return;
    } else {
    console.log(app)
    app.classList.remove('open');
    app.classList.add('closing');}
    
    // Animate off screen
    app.style.transform = 'scale(0.8) translateY(20px)';
    app.style.opacity = '0';

    setTimeout(() => {
        app.classList.add('closed');
        app.classList.remove('closing');
        app.id = 'closed';
        resetAppStyles(app);
    }, 300);
}

function resetAppStyles(app) {
    app.style.transform = '';
    app.style.opacity = '';
    app.style.transition = '';
}

function openSplitView(app) {
    const menu = document.querySelector('.bottom-menu');
    console.log('is split',document.getElementById('splitAppFrame'))
    if(document.getElementById('splitAppFrame') !== null){
        closeApp(app, true)
        return;
    } else {
    menu.classList.toggle('open');}
        //appOpen=!appOpen;


    //const el=document.createElement('ul>')
    //for()

    /*app.classList.add('split-top');

    app.style.transform = 'translateY(0) scale(0.92)';
    screen.style.background = '';

    // Lock app to top half
    app.style.height = '50%';
    app.style.top = '0';*/

    // TODO:
    // - show app picker for bottom half
    // - or auto-open last app
}