let dist = 0;
let lastDist = 0;
let distAcc = 0;
let didScroll = false;
let lastHref = window.location.href;
const dpr = window.devicePixelRatio;
const PXTOCM = 2.54 / (96 * dpr);
x = 0;

window.onscroll = () => {
    didScroll = true;
    let distanceTravelled = window.scrollY * PXTOCM;
    let href = window.location.href;
    if (lastDist < distanceTravelled) {
        dist = distanceTravelled - lastDist;
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
        // if (host !== lastHost) {
        //     console.log('host mismatch');
        // }
        chrome.runtime.sendMessage({
            'distMsg': {
                dist: Number(distAcc.toFixed(3)),
                host: host
            }
        });
        console.log('dist ', distAcc);
        distAcc = 0;
        //lastHost = host;
    }
}, 3000);