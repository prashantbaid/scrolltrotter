chrome.runtime.onInstalled.addListener(() => {
    const initialObj = {
        totalDistance: 0,
        distanceToday: 0,
        distanceThisMonth: 0,
        thisMonth: new Date().toLocaleString('default', { month: 'long' }),
        today: new Date().toLocaleDateString(),
        topTrails: []
    }

    chrome.storage.local.get('distObj', (items) => {
        if (!items.distObj) {
            chrome.storage.local.set({ distObj: initialObj, theme: 'dark', unit: 'km', distByHost: [] });
        }
    });
});

chrome.runtime.onMessage.addListener((req, sender) => {
    let distHost;
    chrome.storage.local.get(['distObj', 'distByHost'], (items) => {
        const distObj = items.distObj;
        let distByHost = items.distByHost;
        const scriptMsg = req.scriptMsg;

        console.log('scriptMsg ', scriptMsg.dist);

        const newDistance = distObj.totalDistance + scriptMsg.dist;
        distObj.totalDistance = newDistance;

        if (distObj.today === new Date().toLocaleDateString()) {
            distObj.distanceToday = round(distObj.distanceToday + scriptMsg.dist);
        } else {
            distObj.distanceToday = scriptMsg.dist;
            distObj.today = new Date().toLocaleDateString();
        }
        if (distObj.thisMonth === new Date().toLocaleString('default', { month: 'long' })) {
            distObj.distanceThisMonth = round(distObj.distanceThisMonth + scriptMsg.dist);
        } else {
            distObj.distanceThisMonth = scriptMsg.dist;
            distObj.today = new Date().toLocaleString('default', { month: 'long' });
        }
        distByHost = addHost(distByHost, scriptMsg.host, scriptMsg.dist);
        distObj.topTrails = setTopTrails(distByHost);
        chrome.storage.local.set({ distObj, distByHost });
    })
});

const round = (num) => Math.round(num * 1000) / 1000;


const setTopTrails = (arr) => {
    arr.sort((a, b) => b.dist - a.dist);
    return arr.filter((ele, i) => i < 20);
}

const addHost = (arr, host, dist) => {
    let index = arr.findIndex((ele) => ele.host === host);
    if (index > -1) {
        arr[index].host = host;
        arr[index].dist = round(arr[index].dist + dist);
    } else {
        arr.push({
            host,
            dist
        })
    }
    return arr;
}