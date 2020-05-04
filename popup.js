var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-29156353-3']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();

let distObj;
let currentUnit;

$(document).ready(() => {
    chrome.storage.local.get('distObj', (items) => {
        distObj = items.distObj;
        if (distObj.topTrails.length === 0) {
            $('#bottom').hide();
        }
        initialize();
        setDistances(distObj, currentUnit);
    });


    $("body").on("click", "div#theme", setTheme);
    $("body").on("click", "a#moreTrails", moreTrails);
    $("body").on("click", "div#backBtn", goBack);
    $("body").on("click", "span#km", setUnit.bind(null, 'km'));
    $("body").on("click", "span#mi", setUnit.bind(null, 'mi'));
    $("body").on("click", "a#clearList", clearList);
});


const setDistances = (distObj, unit) => {
    const totalDist = convertUnit(distObj.totalDistance, unit);
    const distToday = convertUnit(distObj.distanceToday, unit);
    const distThisMonth = convertUnit(distObj.distanceThisMonth, unit);
    const totalDistParts = totalDist.dist.split('.');
    const distTodayParts = distToday.dist.split('.');
    const distThisMonthParts = distThisMonth.dist.split('.');

    const distByHost = distObj.topTrails;
    let html = '';

    distByHost.some((ele, i) => {
        if (i === 3) {
            html += `<div class="moreDiv"><a href='#' id='moreTrails'>+More Trails</a></div>`;
            return true;
        }
        const host = ele.host;
        const convertedDist = convertUnit(ele.dist, unit);
        html += `<div class='listItem'><div class='listBody'><div>${ele.host}</div><div>${convertedDist.dist}${convertedDist.unit}</div></div></div>`
        $('#bottom').show();
    });

    $('#text').html(`<span id='todayDW' class="whole">${distTodayParts[0]}</span><span id='todayDF' class="fraction">.${distTodayParts[1]}${distToday.unit}</span>`);
    $('#text2').html(`<span id='totalDW' class="whole">${distThisMonthParts[0]}</span><span id='totalDF' class="fraction">.${distThisMonthParts[1]}${distThisMonth.unit}</span>`);
    $('#text3').html(`<span id='totalDW' class="whole">${totalDistParts[0]}</span><span id='totalDF' class="fraction">.${totalDistParts[1]}${totalDist.unit}</span>`);
    $('#trails').html(html);

    if ($('#allTrails').is(':visible')) {
        moreTrails();
    }
}

const initialize = () => {
    $('#allTrails').hide();
    const themeIcons = {
        'dark': 'img/sun.png',
        'light': 'img/moon.png'
    }
    chrome.storage.local.get('theme', (result) => {
        const theme = result.theme;
        document.documentElement.setAttribute('data-theme', theme);
        $("#themeIcon").attr("src", themeIcons[theme]);
    });
    chrome.storage.local.get('unit', (result) => {
        const unit = result.unit;
        currentUnit = unit;
        toggleUnit(unit);
    });
}

const setUnit = (unit) => {
    chrome.storage.local.set({ unit });
    toggleUnit(unit);

}
const convertToImperial = (dist, unit) => {
    const CM_TO_INCH = 0.3937;
    const M_TO_FT = 3.28084;
    const KM_TO_MI = 0.6214;
    if (unit === 'cm') {
        dist = dist * CM_TO_INCH;
        return { dist: dist.toFixed(2), unit: 'in' }
    } else if (unit === 'm') {
        dist = dist * M_TO_FT;
        return { dist: dist.toFixed(2), unit: 'ft' }
    } else if (unit === 'km') {
        dist = dist * KM_TO_MI;
        return { dist: dist.toFixed(2), unit: 'mi' }
    }
}

const convertUnit = (dist, unit) => {
    let newDist;
    let newUnit;
    if (dist <= 10) {
        newDist = dist;
        newUnit = 'cm';
    } else if (dist > 10 && dist <= 16000) {
        newDist = (dist / 100);
        newUnit = 'm';
    } else if (dist > 16000) {
        newDist = (dist / 100000);
        newUnit = 'km';
    }

    if (unit === 'mi') return convertToImperial(newDist, newUnit);
    return { dist: newDist.toFixed(2), unit: newUnit };
}

const moreTrails = () => {
    $('#home').hide();
    const distByHost = distObj.topTrails;
    let html = '';
    distByHost.some((ele, i) => {
        host = ele.host;
        const convertedDist = convertUnit(ele.dist, currentUnit);
        html += `<div class='listItem'><div class='listBody'><div>${ele.host}</div><div>${convertedDist.dist}${convertedDist.unit}</div></div></div>`
        return i === 19;
    });
    $('.trailList').html(html);
    $('#allTrails').show();
}

const goBack = () => {
    $('#allTrails').hide();
    $('#home').show();
}

const clearList = () => {
    const result = confirm('This will permanently delete the list. Are you sure?');
    if (result) {
        chrome.storage.local.get('distObj', (items) => {
            distObj = items.distObj;
            distObj.distanceByHost = [];
            chrome.storage.local.set({ distObj });
            setDistances(distObj, currentUnit);
            goBack();
        });

    }
}

const toggleUnit = (unit) => {
    currentUnit = unit;
    if (unit === 'mi') {
        setDistances(distObj, 'mi');
        $('#km').css({ 'opacity': '0.4', cursor: 'pointer', title: 'convert unit to kms' });
        $('#mi').css({ 'opacity': 1, cursor: 'unset' });
        chrome.storage.local.set({ unit: 'mi' });
    } else {
        setDistances(distObj, 'km');
        $('#mi').css({ 'opacity': '0.4', cursor: 'pointer', title: 'convert unit to miles' });
        $('#km').css({ 'opacity': 1, cursor: 'unset' });
        chrome.storage.local.set({ unit: 'km' });
    }
}

const setTheme = (step) => {
    chrome.storage.local.get('theme', (items) => {
        const theme = items.theme;
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'dark');
            $("#themeIcon").attr({ "src": "img/sun.png", "title": "click here to enable light mode" });
            chrome.storage.local.set({ theme: 'dark' });
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            $("#themeIcon").attr({ "src": "img/moon.png", "title": "click here to enable dark mode" });
            chrome.storage.local.set({ theme: 'light' });
        }
    });
}