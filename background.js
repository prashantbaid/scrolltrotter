chrome.runtime.onInstalled.addListener(() => {
    const initialObj = {
        totalDistance: 0,
        distanceToday: 0,
        distanceThisMonth: 0,
        thisMonth: new Date().toLocaleString('default', { month: 'long' }),
        today: new Date().toLocaleDateString(),
        distanceByHost: []
    }
    chrome.storage.local.set({ distObj: initialObj, theme: 'dark', unit: 'km' }, () => {
        console.log("Distance initialized");
    });
    chrome.storage.local.set({ theme: 'dark' });
});

chrome.runtime.onMessage.addListener((req, sender) => {
    chrome.storage.local.get('distObj', (items) => {
        const distObj = items.distObj;
        const distMsg = req.distMsg;
        const newDistance = distObj.totalDistance + distMsg.dist;
        distObj.totalDistance = newDistance;
        if (distObj.today === new Date().toLocaleDateString()) {
            distObj.distanceToday = distObj.distanceToday + distMsg.dist;
        } else {
            distObj.distanceToday = distMsg.dist;
            distObj.today = new Date().toLocaleDateString();
        }
        if (distObj.thisMonth === new Date().toLocaleString('default', { month: 'long' })) {
            distObj.distanceThisMonth = distObj.distanceThisMonth + distMsg.dist;
        } else {
            distObj.distanceThisMonth = distMsg.dist;
            distObj.today = new Date().toLocaleString('default', { month: 'long' });
            //monthly clean up of the hostname array
            distObj.distanceByHost = cleanUpHostArr(arr);
        }
        distObj.distanceByHost = addHost(distObj.distanceByHost, distMsg.host, distMsg.dist);
        chrome.storage.local.set({ distObj }, () => {})
    })
});

const cleanUpHostArr = (arr) => {
    if (arr.length < 100) {
        return;
    } else {
        arr.sort((a, b) => b.dist - a.dist);
        return arr.filter((ele, i) => i < 100);
    }
}


const addHost = (arr, host, dist) => {
    let index = arr.findIndex((ele) => ele.host === host);
    if (index > -1) {
        arr[index].host = host;
        arr[index].dist = arr[index].dist + dist;
    } else {
        arr.push({
            host,
            dist
        })
    }
    return arr;
}