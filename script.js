(function () {
    
    function addClass(el, cls) {
        if (!el) return;
        if (el.classList) el.classList.add(cls);
        else if ((' ' + (el.className || '') + ' ').indexOf(' ' + cls + ' ') === -1) el.className += (el.className ? ' ' : '') + cls;
    }

    
    if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    
    function scrollToTop() {
        try { window.scrollTo(0, 0); } catch (e) { /* ignore */ }
    }
    if (window.addEventListener) {
        window.addEventListener('pageshow', scrollToTop);
    } else if (window.attachEvent) {
        window.attachEvent('onload', scrollToTop);
    }

    
        
        function adjustFinalRow(/*gallery*/) {
            
            try {
                var wrappers = document.querySelectorAll ? document.querySelectorAll('.content-section.gallery > .final-row') : [];
                for (var wi = 0; wi < wrappers.length; wi++) {
                    var w = wrappers[wi];
                    try {
                        var children = Array.prototype.slice.call(w.children);
                        for (var ci = 0; ci < children.length; ci++) {
                            try {
                                children[ci].style.width = '';
                                children[ci].style.flex = '';
                                children[ci].style.boxSizing = '';
                                var im = children[ci].querySelector && children[ci].querySelector('img');
                                if (im) {
                                    im.style.width = '';
                                    im.style.height = '';
                                    im.style.maxWidth = '';
                                    im.style.maxHeight = '';
                                    im.style.display = '';
                                    im.style.boxSizing = '';
                                }
                            } catch (e) {}
                            w.parentNode.insertBefore(children[ci], w);
                        }
                    } catch (e) {}
                    try { w.parentNode.removeChild(w); } catch (e) {}
                }
            } catch (e) {}
    }

    function adjustAllGalleries() {
        var galleries = document.querySelectorAll ? document.querySelectorAll('.content-section.gallery') : [];
        for (var i = 0; i < galleries.length; i++) adjustFinalRow(galleries[i]);
    }

    
    var resizeTimeout = null;
    function onResize() {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(adjustAllGalleries, 120);
    }
    if (window.addEventListener) window.addEventListener('resize', onResize);
    else if (window.attachEvent) window.attachEvent('onresize', onResize);

    if (window.addEventListener) {
        window.addEventListener('load', adjustAllGalleries);
        window.addEventListener('DOMContentLoaded', adjustAllGalleries);
    } else if (window.attachEvent) {
        window.attachEvent('onload', adjustAllGalleries);
    }

    
    function initGalleryImageHints() {
        var items = document.querySelectorAll ? document.querySelectorAll('.gallery-item') : [];
        for (var i = 0; i < items.length; i++) {
            try {
                var el = items[i];
                var tag = (el.tagName || '').toUpperCase();
                if (tag === 'IMG') {
                    if (!el.getAttribute('loading')) el.setAttribute('loading', 'lazy');
                    if (!el.getAttribute('decoding')) el.setAttribute('decoding', 'async');
                } else if (tag === 'VIDEO') {
                    
                    if (!el.getAttribute('preload')) el.setAttribute('preload', 'metadata');
                    
                    if (!el.getAttribute('playsinline')) el.setAttribute('playsinline', '');
                    
                    if (!el.hasAttribute('controls')) el.setAttribute('controls', '');
                }
            } catch (e) { /* ignore */ }
        }
    }
    if (window.addEventListener) document.addEventListener('DOMContentLoaded', initGalleryImageHints);
    else if (window.attachEvent) window.attachEvent('onload', initGalleryImageHints);

    
    function initBackgroundAudio() {
        
        
        var bg = document.getElementById('bgm');
        if (!bg) {
            try {
                
                var embeds = document.getElementsByTagName('embed');
                for (var ei = embeds.length - 1; ei >= 0; ei--) {
                    var em = embeds[ei];
                    try { if (em.name && /BGM/i.test(em.name)) em.parentNode.removeChild(em); } catch (e) {}
                }
                bg = document.createElement('audio');
                bg.id = 'bgm';
                bg.src = 'audio/bgm.mp3';
                bg.loop = true;
                bg.preload = 'auto';
                bg.autoplay = true;
                bg.muted = true; 
                bg.playsInline = true;
                bg.setAttribute('playsinline', '');
                bg.style.display = 'none';
                document.body.appendChild(bg);
            } catch (e) { return; }
        }
        try { bg.muted = true; bg.volume = 0; bg.play().catch(function(){}); } catch (e) {}

        var triggered = false;
        function fadeInAudio(duration) {
            duration = typeof duration === 'number' ? duration : 1200;
            var start = null;
            function step(ts) {
                if (start === null) start = ts;
                var elapsed = ts - start;
                var t = Math.min(1, elapsed / duration);
                try { bg.volume = t; } catch (e) {}
                if (t < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        }

        function unlock() {
            if (triggered) return;
            triggered = true;
            try { bg.muted = false; bg.play().catch(function(){}); } catch (e) {}
            fadeInAudio(1200);
            
            window.removeEventListener('scroll', handler);
            window.removeEventListener('wheel', handler);
            window.removeEventListener('touchstart', handler);
            window.removeEventListener('touchmove', handler);
            window.removeEventListener('pointerdown', handler);
            window.removeEventListener('mousedown', handler);
            window.removeEventListener('keydown', handler);
            removeUnlockButton();
            removeUnlockOverlay();
        }


            function tryUnlock() {
                return new Promise(function(resolve) {
                    try {
                        bg.muted = false;
                        var p = bg.play();
                        if (!p || typeof p.then !== 'function') {
                            
                            resolve(!bg.muted);
                        } else {
                            p.then(function() { resolve(true); }).catch(function() { bg.muted = true; resolve(false); });
                        }
                    } catch (e) { try { bg.muted = true; } catch (e2) {} resolve(false); }
                });
            }

            var unlockButton = null;
            function createUnlockButton() {
                if (unlockButton) return unlockButton;
                try {
                    unlockButton = document.createElement('button');
                    unlockButton.id = 'audio-unlock-btn';
                    unlockButton.textContent = 'Enable sound';
                    unlockButton.style.position = 'fixed';
                    unlockButton.style.right = '1rem';
                    unlockButton.style.bottom = '1rem';
                    unlockButton.style.zIndex = 9999;
                    unlockButton.style.padding = '0.6rem 0.9rem';
                    unlockButton.style.borderRadius = '0.6rem';
                    unlockButton.style.border = 'none';
                    unlockButton.style.background = 'rgba(0,0,0,0.65)';
                    unlockButton.style.color = 'white';
                    unlockButton.style.fontFamily = 'sans-serif';
                    unlockButton.style.cursor = 'pointer';
                    unlockButton.style.backdropFilter = 'blur(4px)';
                    unlockButton.addEventListener('click', function () { tryUnlock().then(function(ok){ if (ok) unlock(); }); });
                    document.body.appendChild(unlockButton);
                } catch (e) { unlockButton = null; }
                return unlockButton;
            }

            function removeUnlockButton() {
                try { if (unlockButton && unlockButton.parentNode) unlockButton.parentNode.removeChild(unlockButton); } catch (e) {}
                unlockButton = null;
            }

            
            var unlockOverlay = null;
            function createUnlockOverlay() {
                if (unlockOverlay) return unlockOverlay;
                try {
                    unlockOverlay = document.createElement('div');
                    unlockOverlay.id = 'audio-unlock-overlay';
                    unlockOverlay.setAttribute('role', 'button');
                    unlockOverlay.setAttribute('aria-label', 'Enable background audio');
                    unlockOverlay.textContent = 'Tap anywhere to enable sound';
                    unlockOverlay.style.position = 'fixed';
                    unlockOverlay.style.left = '0';
                    unlockOverlay.style.top = '0';
                    unlockOverlay.style.right = '0';
                    unlockOverlay.style.bottom = '0';
                    unlockOverlay.style.display = 'flex';
                    unlockOverlay.style.alignItems = 'center';
                    unlockOverlay.style.justifyContent = 'center';
                    unlockOverlay.style.zIndex = 9998;
                    unlockOverlay.style.background = 'rgba(0,0,0,0.35)';
                    unlockOverlay.style.color = 'white';
                    unlockOverlay.style.fontFamily = 'sans-serif';
                    unlockOverlay.style.fontSize = '1.1rem';
                    unlockOverlay.style.cursor = 'pointer';
                    unlockOverlay.addEventListener('pointerdown', function () {
                        tryUnlock().then(function(ok) { if (ok) unlock(); });
                    }, { passive: true });
                    document.body.appendChild(unlockOverlay);
                } catch (e) { unlockOverlay = null; }
                return unlockOverlay;
            }

            function removeUnlockOverlay() {
                try { if (unlockOverlay && unlockOverlay.parentNode) unlockOverlay.parentNode.removeChild(unlockOverlay); } catch (e) {}
                unlockOverlay = null;
            }
        
        window.addEventListener('scroll', handler, { passive: true });
        window.addEventListener('wheel', handler, { passive: true });
        window.addEventListener('touchstart', handler, { passive: true });
        window.addEventListener('pointerdown', handler, { passive: true });
        window.addEventListener('mousedown', handler, { passive: true });
        window.addEventListener('keydown', handler, { passive: true });
            function handler(ev) {
                
                
                tryUnlock().then(function(ok) {
                    if (ok) unlock();
                    else { createUnlockOverlay(); createUnlockButton(); }
                });
            }
    }
    if (window.addEventListener) document.addEventListener('DOMContentLoaded', initBackgroundAudio);
    else if (window.attachEvent) window.attachEvent('onload', initBackgroundAudio);
    
    if (document.readyState !== 'loading') initBackgroundAudio();

    function initStartOverlay() {
        const bgm = document.getElementById('bgm');
        const overlay = document.getElementById('start-overlay') || createOverlay();
        
        document.body.classList.add('is-locked');

        overlay.addEventListener('click', function() {
            
            document.body.classList.remove('is-locked');
            overlay.classList.add('hidden');

            
            if (bgm) {
                bgm.muted = false;
                bgm.volume = 1.0;
                bgm.play().catch(e => console.log("Audio waiting for more interaction"));
            }

            
            setTimeout(() => overlay.remove(), 500);
        }, { once: true }); 
    }

    function createOverlay() {
        const ov = document.createElement('div');
        ov.id = 'start-overlay';
        ov.innerHTML = '<div class="title">Kliknij :3</div>';
        document.body.appendChild(ov);
        return ov;
    }

    
    if (document.readyState !== 'loading') {
        initStartOverlay();
    } else {
        document.addEventListener('DOMContentLoaded', initStartOverlay);
    }
    if (window.addEventListener) document.addEventListener('DOMContentLoaded', initStartOverlay);
    else if (window.attachEvent) window.attachEvent('onload', initStartOverlay);
    if (document.readyState !== 'loading') initStartOverlay();


    
    function handleIntersection(entries, observer) {
        
        var visibleEntries = [];
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
                visibleEntries.push(entries[i]);
            }
        }

        
        visibleEntries.forEach(function(entry, index) {
            setTimeout(function() {
                addClass(entry.target, 'visible');
            }, index * 100); 
            
            try { observer.unobserve(entry.target); } catch (e) { /* ignore */ }
        });
    }

    if (typeof window.IntersectionObserver !== 'undefined') {
        
        var observer = new window.IntersectionObserver(handleIntersection, { root: null, threshold: 0.15 });
        if (document.querySelectorAll) {
            var targets = document.querySelectorAll('.scroll-fade');
            for (var t = 0; t < targets.length; t++) observer.observe(targets[t]);
        }
    } else {
        
        if (document.addEventListener) document.addEventListener('DOMContentLoaded', function() {
            var targets = document.querySelectorAll ? document.querySelectorAll('.scroll-fade') : [];
            for (var tt = 0; tt < targets.length; tt++) addClass(targets[tt], 'visible');
        });
    }

    
    function initVideoDucking() {
        const bgm = document.getElementById('bgm');
        if (!bgm) return;

        const videos = document.querySelectorAll('video');
        if (videos.length === 0) return;

        let fadeInterval = null;

        
        function fadeBgmTo(targetVolume) {
            if (fadeInterval) clearInterval(fadeInterval);
            
            fadeInterval = setInterval(() => {
                let current = bgm.volume;
                
                const step = 0.05;

                
                if (Math.abs(current - targetVolume) < step) {
                    bgm.volume = targetVolume;
                    clearInterval(fadeInterval);
                    fadeInterval = null;
                } else if (current > targetVolume) {
                    bgm.volume = Math.max(0, current - step);
                } else {
                    bgm.volume = Math.min(1, current + step);
                }
            }, 50); 
        }

        function checkVideos() {
            
            let isAnyVideoPlaying = false;
            videos.forEach(v => {
                
                if (!v.paused && !v.ended && v.readyState > 2) {
                    isAnyVideoPlaying = true;
                }
            });

            if (isAnyVideoPlaying) {
                
                fadeBgmTo(0.2);
            } else {
                
                fadeBgmTo(1.0);
            }
        }

        
        videos.forEach(v => {
            v.addEventListener('play', checkVideos);
            v.addEventListener('pause', checkVideos);
            v.addEventListener('ended', checkVideos);
        });
    }
    
    
    if (document.readyState !== 'loading') initVideoDucking();
    else document.addEventListener('DOMContentLoaded', initVideoDucking);


    
// --- 1. Audio Assets Initialization ---
    const soundEnter = new Audio('enter.mp3');
    const soundBack = new Audio('back.mp3');
    const soundScroll = new Audio('scroll.mp3');

    // --- 2. Scroll Sound Logic (Variable Frequency) ---
    function initScrollSounds() {
        let lastScrollTop = 0;
        let accumulatedDistance = 0;
        const triggerDistance = 60; // Pixels to scroll before playing sound

        window.addEventListener('scroll', function() {
            // Only play if the initial overlay is gone/unlocked
            if (document.body.classList.contains('is-locked')) return;

            let st = window.pageYOffset || document.documentElement.scrollTop;
            let distanceMoved = Math.abs(st - lastScrollTop);
            
            accumulatedDistance += distanceMoved;

            if (accumulatedDistance >= triggerDistance) {
                // Clone node allows sounds to overlap when scrolling fast
                const s = soundScroll.cloneNode();
                s.volume = 0.3; 
                s.play().catch(() => {});
                accumulatedDistance = 0;
            }
            lastScrollTop = st <= 0 ? 0 : st;
        }, { passive: true });
    }

    // --- 3. Lightbox (Zoom) Sound Integration ---
    function initLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const closeBtn = document.querySelector('.lightbox-close');
        
        if (!lightbox || !lightboxImg) return;

        const images = document.querySelectorAll('.zoomable');
        
        images.forEach(img => {
            img.addEventListener('click', function(e) {
                e.preventDefault();
                lightboxImg.src = this.src;
                lightbox.classList.add('active');
                
                // Play Enter Sound
                soundEnter.currentTime = 0;
                soundEnter.play().catch(e => console.log("Sound blocked"));
            });
        });

        function closeLightbox() {
            if (!lightbox.classList.contains('active')) return;
            
            lightbox.classList.remove('active');
            
            // Play Back Sound
            soundBack.currentTime = 0;
            soundBack.play().catch(e => console.log("Sound blocked"));
            
            setTimeout(() => { lightboxImg.src = ''; }, 300);
        }

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeLightbox();
        });
    }

    // --- 4. Call Initializers ---
    if (document.readyState !== 'loading') {
        initLightbox();
        initScrollSounds();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            initLightbox();
            initScrollSounds();
        });
    }

})();