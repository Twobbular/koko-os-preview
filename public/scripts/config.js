let isDragging = false;
let gestures=true;//false
let previewOpen=false;
let isDev=true;
isDev=true;
/* =========================================
   1. DATA CONFIGURATION
   ========================================= */
/*const appDB = {
    'mail': { name: 'Mail', icon: 'fa-envelope', color: '#007AFF' },
    'cal':  { name: 'Calendar', icon: 'fa-calendar-alt', color: '#FF3B30' },
    'photos': { name: 'Photos', icon: 'fa-images', color: 'linear-gradient(to bottom right, #ff9a9e, #fad0c4)', app: 'photos-app.htm' },
    'camera': { name: 'Camera', icon: 'fa-camera', color: '#333' },
    //'maps': { name: 'Maps', icon: 'fa-map-marked-alt', color: '#34C759', app: 'maps-app.htm', installing: true },
    'weather': { name: 'Weather', icon: 'fa-cloud-sun', color: '#5AC8FA', app: 'weather-app.htm', widgets: [{name: 'weather', widget: 'weather-widget.htm'}, {name: 'forecast', widget: 'forecast-widget.htm'}] },
    'clock': { name: 'Clock', icon: 'fa-clock', color: '#000', app: 'clock-app.htm', widgets: [{name: 'clock', widget: 'clock-widget.htm'}, {name: 'alarm', widget: 'alarm-widget.htm'}] },
    'notes': { name: 'Notes', icon: 'fa-sticky-note', color: '#FFD60A' },
    'settings': { name: 'Settings', icon: 'fa-cog', color: '#8E8E93' },
    'store': { name: 'App Store', icon: 'fa-layer-group', color: '#007AFF' },
    'browser': { name: 'Browser', icon: 'img:assets/icons/browser.svg', color: '#007AFF' },
    'music': { name: 'Music', icon: 'fa-music', color: '#FF2D55' },
    'files': { name: 'Files', icon: 'fa-folder', color: '#007AFF' },
    //'health': { name: 'Health', icon: 'fa-heart', color: '#FF2D55' },
    //'wallet': { name: 'Wallet', icon: 'fa-wallet', color: '#000' },
    'test': { name: 'Test App', icon: 'fa-vial', color: '#5856D6', app: 'test.htm' }
};*/

const appDB = {
    'mail': { name: 'Mail', icon: 'fa-envelope', color: '#007AFF' },
    'cal':  { name: 'Calendar', icon: 'fa-calendar-alt', color: '#FF3B30' },
    'photos': { name: 'Photos', icon: 'fa-images', app: 'photos-app.htm' , color: 'linear-gradient(to bottom right, #ff9a9e, #fad0c4)'},
    'camera': { name: 'Camera', icon: 'fa-camera', color: '#333' },
    'phone': { name: 'Phone', icon: 'fa fa-phone', app: 'phone.htm', color: '#34C759' },
    //'maps': { name: 'Maps', icon: 'fa-map-marked-alt', color: '#34C759', app: 'maps-app.htm', installing: true },
    'weather': { name: 'Weather', icon: 'fa-cloud-sun', app: 'weather-app.htm', color: '#5AC8FA', widgets: [{name: 'weather', widget: 'weather-widget.htm'}, {name: 'forecast', widget: 'forecast-widget.htm'}] },
    'clock': { name: 'Clock', icon: 'fa-clock', app: 'clock-app.htm', color: '#000', widgets: [{name: 'clock', widget: 'clock-widget.htm'}, {name: 'alarm', widget: 'alarm-widget.htm'}] },
    'notes': { name: 'Notes', icon: 'fa-sticky-note', color: '#FFD60A' },
    'settings': { name: 'Settings', icon: 'fa-cog', app: 'settings-app.htm', color: '#8E8E93' },
    'store': { name: 'App Store', icon: 'fa-layer-group', color: '#007AFF' },
    'browser': { name: 'Browser', icon: 'img:assets/icons/browser.svg', color: '#007AFF', app: 'browser/browser-app.htm', permissions: ['camera', 'microphone', 'clipboard-read', 'clipboard-write'] },
    'music': { name: 'Music', icon: 'fa-music', color: '#FF2D55' },
    'files': { name: 'Files', icon: 'fa-folder', color: '#007AFF' },
    'compass': { name: 'Compass', icon: 'fa-compass', app: 'compass.htm' },
    'personalize': { name: 'personalize', icon: 'fa-palette', app: 'personalize.htm' },
    //'health': { name: 'Health', icon: 'fa-heart', color: '#FF2D55' },
    //'wallet': { name: 'Wallet', icon: 'fa-wallet', color: '#000' },
    'test': { name: 'Test App', requiresDev: true, color: '#5856D6' , icon: 'fa-vial', app: 'test.htm', permissions: ['camera', 'microphone', 'clipboard-read', 'clipboard-write'] },
    'control-panel': { name: 'Control Panel', requiresDev: true, icon: 'fa-brands fa-whmcs', app: 'control.htm', permissions: ['camera', 'microphone', 'clipboard-read', 'clipboard-write'] }
};

const defaultPages = [
    [
        {
            "type": "widget",
            "app": "clock",
            "widget": "full-clock-widget.htm",
            "width": 5,
            "height": 1
        },
        null,
        null,
        null,
        null,
        "weather",
        "photos",
        "mail",
        "cal",
        "notes",
        "settings",
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
    ],
    [
        "files",
        "clock",
        "browser",
        "store",
        null,
        null,
        null,
        null,
        null,
        {
            "type": "widget",
            "app": "clock",
            "widget": "headphones-widget.htm",
            "width": 2,
            "height": 1
        },
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
    ],
    [
        {
            "type": "widget",
            "app": "weather",
            "widget": "weather-widget.htm",
            "width": 5,
            "height": 2
        },
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
    ]
]/*[
    [{ type: 'widget', app: 'clock', widget: 'full-clock-widget.htm', width: 5, height: 1 }, null, null, null, null, 'weather', 'photos', 'mail', 'cal', 'notes', 'settings', null, null, null, null, null, null, null, null],
    ['files', 'clock', 'browser', 'store', null, null, null, null, null, { type: 'widget', app: 'clock', widget: 'headphones-widget.htm', width: 2, height: 1 }, null, null, null, null, null, null, null, null, null, null],
    [{ type: 'widget', app: 'weather', widget: 'weather-widget.htm', width: 5, height: 2 }, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
];*/

// Widget examples (can be added to pages)
// { type: 'widget', app: 'weather', widget: 'weather-widget.htm', width: 2, height: 2 }

const defaultDock = ['store', 'browser', 'mail', 'music', 'camera'];
const info = {
    news: {}
};

/*const info={
    'news': {
        1:{title: 'Latest News', content: 'Breaking news: New features added to Glass OS!', icon: 'fa-newspaper', url: '#', thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2670&auto=format&fit=crop'}, 
        2: {title: 'System Maintenance', content: 'Scheduled maintenance on June 15th.', icon: 'fa-wrench', url: '#', thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670'}
    }
}*/
let savedState = JSON.parse(localStorage.getItem('state'));
let pages = savedState ? savedState.pages : JSON.parse(JSON.stringify(defaultPages));
let dock = savedState ? savedState.dock : JSON.parse(JSON.stringify(defaultDock));

let currentPage = 0;
let currentOpenFolder = null; // Stores {p, i} of current folder

function saveState() {
    localStorage.setItem('state', JSON.stringify({ pages, dock }));
}

let rows=window.getComputedStyle(document.body).getPropertyValue('--grid-rows');
let cols=window.getComputedStyle(document.body).getPropertyValue('--grid-cols');

grid=cols*rows// Test the notification system
//showNotification('Download Complete', 'Maps v2.0 installed successfully', 'fa-download', '#34C759', 3000);