let previousTime = {
    hours: '',
    minutes: ''
};
let wakeLock = null;
let timeoutId = null;

function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();

    if (hours !== previousTime.hours || minutes !== previousTime.minutes) {
        updateDigit('hour-tens', hours[0], previousTime.hours[0] !== hours[0]);
        updateDigit('hour-ones', hours[1], previousTime.hours[1] !== hours[1]);
        updateDigit('minute-tens', minutes[0], previousTime.minutes[0] !== minutes[0]);
        updateDigit('minute-ones', minutes[1], previousTime.minutes[1] !== minutes[1]);
        previousTime = { hours, minutes };
    }

    const delay = (60 - seconds) * 1000 - milliseconds;
    
    const executionStart = performance.now();
    timeoutId = setTimeout(() => {
        const executionTime = performance.now() - executionStart;
        updateClock();
    }, delay - 10);
}

function updateDigit(elementId, newDigit, hasChanged) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.style.backgroundImage = `url('images/${newDigit}.gif')`;
    
    if (hasChanged) {
        element.classList.add('changed');
        setTimeout(() => element.classList.remove('changed'), 500);
    }
}

async function activateWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock activated!');
        } catch (err) {
            console.warn('Wake Lock Error:', err);
        }
    }
}

function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        updateClock();
        activateWakeLock();
    }
}

function initClock() {
    const separator = document.getElementById('separator') || document.createElement('div');
    separator.className = 'digit';
    separator.id = 'separator';
    separator.style.backgroundImage = "url('images/sep.gif')";
    document.querySelector('.clock').insertBefore(separator, document.getElementById('hour-ones').nextSibling);

    const now = new Date();
    previousTime.hours = now.getHours().toString().padStart(2, '0');
    previousTime.minutes = now.getMinutes().toString().padStart(2, '0');
    updateDigit('hour-tens', previousTime.hours[0], false);
    updateDigit('hour-ones', previousTime.hours[1], false);
    updateDigit('minute-tens', previousTime.minutes[0], false);
    updateDigit('minute-ones', previousTime.minutes[1], false);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    activateWakeLock();
    updateClock();
}

window.addEventListener('beforeunload', () => {
    if (timeoutId) clearTimeout(timeoutId);
    if (wakeLock) wakeLock.release().catch(console.warn);
});

window.addEventListener('load', initClock);