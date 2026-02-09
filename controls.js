function initControls() {
    const zoomInBtn = document.getElementById('btn-zoom-in');
    const zoomOutBtn = document.getElementById('btn-zoom-out');
    const zoomText = document.getElementById('zoom-value');
    const fullscreenBtn = document.getElementById('btn-fullscreen');
    const resetBtn = document.getElementById('btn-reset');
    const resetIcon = document.querySelector('.icon-reset');
    const controlsContainer = document.querySelector('.controls-container');
    
    const savedScale = localStorage.getItem('neko-clock-scale');
    let currentScale = savedScale ? parseFloat(savedScale) : 1.0;

    const updateScale = (newScale, save = true) => {
        currentScale = Math.round(Math.min(Math.max(newScale, 0.5), 5.0) * 100) / 100;
        
        document.documentElement.style.setProperty('--clock-scale', currentScale);
        
        if (zoomText) zoomText.textContent = `${Math.round(currentScale * 100)}%`;
        
        if (save) localStorage.setItem('neko-clock-scale', currentScale);
    };

    setTimeout(() => {
        if (controlsContainer) controlsContainer.classList.add('visible');
    }, 500);

    document.addEventListener('click', (e) => {
        if (controlsContainer && !e.target.closest('.controls-bar')) {
            controlsContainer.classList.toggle('hidden');
        }
    });

    updateScale(currentScale, false);

    zoomInBtn.onclick = (e) => { e.stopPropagation(); updateScale(currentScale + 0.01); };
    zoomOutBtn.onclick = (e) => { e.stopPropagation(); updateScale(currentScale - 0.01); };
    
    resetBtn.onclick = (e) => {
        e.stopPropagation();
        updateScale(1.0);
        if (resetIcon) {
            resetIcon.classList.remove('rotate-animation');
            void resetIcon.offsetWidth;
            resetIcon.classList.add('rotate-animation');
        }
    };

    fullscreenBtn.onclick = (e) => {
        e.stopPropagation();
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };
}

window.addEventListener('load', initControls);