function initControls() {
    const zoomInBtn = document.getElementById('btn-zoom-in');
    const zoomOutBtn = document.getElementById('btn-zoom-out');
    const zoomText = document.getElementById('zoom-value');
    const fullscreenBtn = document.getElementById('btn-fullscreen');
    const resetBtn = document.getElementById('btn-reset');
    const resetIcon = document.querySelector('.icon-reset');
    const controlsContainer = document.querySelector('.controls-container');
    
    let currentScale = parseFloat(localStorage.getItem('neko-clock-scale')) || 1.0;
    let zoomInterval = null;
    let delayTimeout = null;
    let currentSpeed = 100;

    const updateScale = (newScale, save = true) => {
        currentScale = Math.round(Math.min(Math.max(newScale, 0.5), 5.0) * 100) / 100;
        document.documentElement.style.setProperty('--clock-scale', currentScale);
        if (zoomText) zoomText.textContent = `${Math.round(currentScale * 100)}%`;
        if (save) localStorage.setItem('neko-clock-scale', currentScale);
    };

    const runAutoZoom = (delta) => {
        updateScale(currentScale + delta);
        
        currentSpeed = Math.max(10, currentSpeed - 5);
        
        zoomInterval = setTimeout(() => runAutoZoom(delta), currentSpeed);
    };

    const startZoom = (delta) => {
        updateScale(currentScale + delta);
        currentSpeed = 100;

        delayTimeout = setTimeout(() => {
            runAutoZoom(delta);
        }, 400);
    };

    const stopZoom = () => {
        clearTimeout(delayTimeout);
        clearTimeout(zoomInterval);
        zoomInterval = null;
        delayTimeout = null;
    };

    [
        { btn: zoomInBtn, delta: 0.01 },
        { btn: zoomOutBtn, delta: -0.01 }
    ].forEach(({ btn, delta }) => {
        if (!btn) return;

        btn.addEventListener('mousedown', (e) => { 
            if (e.button !== 0) return;
            e.stopPropagation(); 
            startZoom(delta); 
        });

        btn.addEventListener('touchstart', (e) => { 
            if (e.cancelable) e.preventDefault(); 
            e.stopPropagation(); 
            startZoom(delta); 
        }, { passive: false });

        window.addEventListener('mouseup', stopZoom);
        window.addEventListener('touchend', stopZoom);
        window.addEventListener('touchcancel', stopZoom);
    });

    setTimeout(() => {
        if (controlsContainer) controlsContainer.classList.add('visible');
    }, 500);

    document.addEventListener('click', (e) => {
        if (controlsContainer && !e.target.closest('.controls-bar')) {
            controlsContainer.classList.toggle('hidden');
        }
    });

    updateScale(currentScale, false);

    if (resetBtn) {
        resetBtn.onclick = (e) => {
            e.stopPropagation();
            updateScale(1.0);
            if (resetIcon) {
                resetIcon.classList.remove('rotate-animation');
                void resetIcon.offsetWidth;
                resetIcon.classList.add('rotate-animation');
            }
        };
    }

    if (fullscreenBtn) {
        fullscreenBtn.onclick = (e) => {
            e.stopPropagation();
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen();
            }
        };
    }
}

window.addEventListener('load', initControls);