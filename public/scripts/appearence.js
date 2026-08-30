let appIconShapes='squircle'
appIconShapes = 'circle'
let polygon = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
let backgroundMove=true;
let backgroundImage = "/public/assets/images/boliviainteligente-37WxvlfW3to-unsplash.jpg"//'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
let virtual_brightness=false;
window.colorScheme='dark';//'light';
let columns = 4;
let gridRows = 7;
let isdock = false;
let docklen = 4;
let appSize = 1;

let appSizes = [4, 50, 60]
//22px
if (defaultPages.length === 0) {
    defaultPages.push(Array.from({ length: gridRows * gridCols }, () => null));
}
if (appSize) document.documentElement.style.setProperty('--app-size', `${appSizes[appSize]}px`);

if (isdock && docklen < 5) {
    document.getElementById('dock').style=`position: absolute; bottom: 9px; left: 15px; right: 15px;
    height: 80px;
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(7px); -webkit-backdrop-filter: blur(7px);
    border-radius: 32px;
     box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    display: flex; justify-content: space-around; align-items: center;
    z-index: 500;
    border: 1px solid rgba(255,255,255,0.1);`
}

document.documentElement.style.setProperty('--grid-cols', columns);
document.documentElement.style.setProperty('--grid-rows', gridRows);

//currentPage = 2

console.log(document.querySelector('.screen-container'))

const mainScreen = document.getElementById('mainScreen');
mainScreen.style.transition = 'filter 0s ease';
if (virtual_brightness) mainScreen.style.filter = 'brightness(1.1) contrast(1.04) saturate(1.08)';



if (backgroundImage) document.documentElement.style.setProperty('--background-image', `url(${backgroundImage}) center/cover no-repeat`);

switch (appIconShapes) {
    case 'squircle':
        //document.documentElement.style.setProperty('--app-icon-border-radius', '20%');
        break;
    case 'circle':
        document.documentElement.style.setProperty('--app-icon-border-radius', '50%');
        //document.documentElement.style.setProperty('--mini-app-icon-border-radius', '25%');
        break;
    case 'hexagon':
        document.documentElement.style.setProperty('--app-icon-border-radius', '0%');
        //document.documentElement.style.setProperty('--mini-app-icon-border-radius', '0%');
        document.querySelectorAll('.app-icon').forEach(icon => {
            icon.style.clipPath = polygon;
        });
        document.querySelectorAll('.app-icon').forEach(icon => {
            icon.style.clipPath = polygon;
        });
        break;
}

