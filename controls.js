// controls.js
(function() {
    const CONFIG = {
        storageKey: 'app-ui-scale',
        minScale: 0.5,
        maxScale: 5.0,
        defaultScale: 1.0,
        step: 0.01
    };

    let currentScale = parseFloat(localStorage.getItem(CONFIG.storageKey)) || CONFIG.defaultScale;
    let zoomInterval = null;
    let delayTimeout = null;
    let currentSpeed = 100;

    function applyScale(save = true) {
        currentScale = Math.round(Math.min(Math.max(currentScale, CONFIG.minScale), CONFIG.maxScale) * 100) / 100;
        document.documentElement.style.setProperty('--ui-scale', currentScale);
        
        const zoomText = document.getElementById('zoom-value');
        if (zoomText) zoomText.textContent = `${Math.round(currentScale * 100)}%`;
        
        if (save) localStorage.setItem(CONFIG.storageKey, currentScale);
    }

    const runAutoZoom = (delta) => {
        currentScale += delta;
        applyScale();
        currentSpeed = Math.max(10, currentSpeed - 5);
        zoomInterval = setTimeout(() => runAutoZoom(delta), currentSpeed);
    };

    const startZoom = (delta) => {
        currentScale += delta;
        applyScale();
        currentSpeed = 100;
        delayTimeout = setTimeout(() => runAutoZoom(delta), 400);
    };

    const stopZoom = () => {
        clearTimeout(delayTimeout);
        clearTimeout(zoomInterval);
    };

    function setupEventListeners() {
        const ui = {
            in: document.getElementById('btn-zoom-in'),
            out: document.getElementById('btn-zoom-out'),
            reset: document.getElementById('btn-reset'),
            fs: document.getElementById('btn-fullscreen'),
            container: document.querySelector('.controls-container')
        };

        // Zoom logic
        [{ btn: ui.in, d: CONFIG.step }, { btn: ui.out, d: -CONFIG.step }].forEach(({ btn, d }) => {
            if (!btn) return;
            btn.addEventListener('mousedown', (e) => { if(e.button === 0) startZoom(d); });
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); startZoom(d); }, {passive: false});
        });

        window.addEventListener('mouseup', stopZoom);
        window.addEventListener('touchend', stopZoom);

        // Reset logic
        if (ui.reset) {
            ui.reset.onclick = () => {
                currentScale = CONFIG.defaultScale;
                applyScale();
                const icon = ui.reset.querySelector('.icon-reset');
                if (icon) {
                    icon.classList.remove('rotate-animation');
                    void icon.offsetWidth;
                    icon.classList.add('rotate-animation');
                }
            };
        }

        // Fullscreen logic
        if (ui.fs) {
            ui.fs.onclick = () => {
                if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
                else document.exitFullscreen();
            };
        }

        // Toggle visibility
        document.addEventListener('click', (e) => {
            if (ui.container && !e.target.closest('.controls-bar')) {
                ui.container.classList.toggle('hidden');
            }
        });

        // Initial show
        setTimeout(() => ui.container?.classList.add('visible'), 500);
    }

    // Инициализация
    window.addEventListener('DOMContentLoaded', () => {
        applyScale(false);
        setupEventListeners();
    });
})();