let lastDist = 0;
let distAcc = 0;
let didScroll = false;
let lastHref = window.location.href;
const dpr = window.devicePixelRatio;
const PXTOCM = 2.54 / (96 * dpr);

window.onscroll = () => {
    didScroll = true;
    let distanceTravelled = window.scrollY * PXTOCM;
    let href = window.location.href;
    if (lastDist < distanceTravelled) {
        let dist = distanceTravelled - lastDist;
        distAcc = distAcc + dist;
    }
    if (href === lastHref) {
        lastDist = distanceTravelled;
    }
    lastHref = href;
}

setInterval(() => {
    if (didScroll) {
        didScroll = false;
        let host = window.location.hostname;
        chrome.runtime.sendMessage({
            'scriptMsg': {
                dist: Math.round(distAcc * 1000) / 1000,
                host: host
            }
        });
        distAcc = 0;
    }
}, 3000);