/**
 * Modern 2025 UI Interactions & Animations
 * Janiuay BPLO - Enhanced User Experience
 */

(function() {
    'use strict';

    // ===== SCROLL REVEAL ANIMATION =====
    const initScrollReveal = () => {
        const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
        
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    };

    // ===== NAVIGATION SCROLL EFFECT =====
    const initNavScroll = () => {
        const nav = document.querySelector('.nav-2025, .header');
        if (!nav) return;

        let lastScroll = 0;
        const scrollThreshold = 100;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > scrollThreshold) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        }, { passive: true });
    };

    // ===== MAGNETIC BUTTON EFFECT =====
    const initMagneticButtons = () => {
        const magneticElements = document.querySelectorAll('.magnetic');
        
        magneticElements.forEach(elem => {
            elem.addEventListener('mousemove', (e) => {
                const rect = elem.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                elem.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });

            elem.addEventListener('mouseleave', () => {
                elem.style.transform = 'translate(0, 0)';
            });
        });
    };

    // ===== SPOTLIGHT EFFECT =====
    const initSpotlight = () => {
        const spotlights = document.querySelectorAll('.spotlight');
        
        spotlights.forEach(spotlight => {
            spotlight.addEventListener('mousemove', (e) => {
                const rect = spotlight.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                spotlight.style.setProperty('--mouse-x', `${x}px`);
                spotlight.style.setProperty('--mouse-y', `${y}px`);
                
                const before = spotlight.querySelector('::before') || spotlight;
                if (before.style) {
                    before.style.left = `${x}px`;
                    before.style.top = `${y}px`;
                }
            });
        });
    };

    // ===== PARALLAX SCROLL =====
    const initParallax = () => {
        const parallaxElements = document.querySelectorAll('.parallax-layer');
        
        if (parallaxElements.length === 0) return;

        let ticking = false;

        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach((el, index) => {
                const speed = (index + 1) * 0.5;
                const yPos = -(scrolled * speed);
                el.style.transform = `translateY(${yPos}px)`;
            });

            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    };

    // ===== SMOOTH SCROLL =====
    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    };

    // ===== STAGGER ANIMATION =====
    const initStaggerAnimation = () => {
        const staggerContainers = document.querySelectorAll('.stagger-container');
        
        staggerContainers.forEach(container => {
            const children = container.children;
            Array.from(children).forEach((child, index) => {
                child.style.animationDelay = `${index * 0.1}s`;
                child.classList.add('stagger-item');
            });
        });
    };

    // ===== COUNTER ANIMATION =====
    const initCounterAnimation = () => {
        const counters = document.querySelectorAll('.counter');
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-target'));
                    const duration = 2000;
                    const step = target / (duration / 16);
                    let current = 0;

                    const updateCounter = () => {
                        current += step;
                        if (current < target) {
                            counter.textContent = Math.floor(current).toLocaleString();
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target.toLocaleString();
                        }
                    };

                    updateCounter();
                    counterObserver.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => counterObserver.observe(counter));
    };

    // ===== TILT EFFECT =====
    const initTiltEffect = () => {
        const tiltElements = document.querySelectorAll('.tilt');
        
        tiltElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            });
        });
    };

    // ===== TEXT SCRAMBLE EFFECT =====
    const initTextScramble = () => {
        const scrambleElements = document.querySelectorAll('.scramble-text');
        const chars = '!<>-_\\/[]{}—=+*^?#________';
        
        class TextScramble {
            constructor(el) {
                this.el = el;
                this.chars = chars;
                this.update = this.update.bind(this);
            }
            
            setText(newText) {
                const oldText = this.el.innerText;
                const length = Math.max(oldText.length, newText.length);
                const promise = new Promise(resolve => this.resolve = resolve);
                this.queue = [];
                
                for (let i = 0; i < length; i++) {
                    const from = oldText[i] || '';
                    const to = newText[i] || '';
                    const start = Math.floor(Math.random() * 40);
                    const end = start + Math.floor(Math.random() * 40);
                    this.queue.push({ from, to, start, end });
                }
                
                cancelAnimationFrame(this.frameRequest);
                this.frame = 0;
                this.update();
                return promise;
            }
            
            update() {
                let output = '';
                let complete = 0;
                
                for (let i = 0, n = this.queue.length; i < n; i++) {
                    let { from, to, start, end, char } = this.queue[i];
                    
                    if (this.frame >= end) {
                        complete++;
                        output += to;
                    } else if (this.frame >= start) {
                        if (!char || Math.random() < 0.28) {
                            char = this.randomChar();
                            this.queue[i].char = char;
                        }
                        output += `<span class="scramble-char">${char}</span>`;
                    } else {
                        output += from;
                    }
                }
                
                this.el.innerHTML = output;
                
                if (complete === this.queue.length) {
                    this.resolve();
                } else {
                    this.frameRequest = requestAnimationFrame(this.update);
                    this.frame++;
                }
            }
            
            randomChar() {
                return this.chars[Math.floor(Math.random() * this.chars.length)];
            }
        }
        
        scrambleElements.forEach(el => {
            const fx = new TextScramble(el);
            const originalText = el.innerText;
            
            el.addEventListener('mouseenter', () => {
                fx.setText(originalText);
            });
        });
    };

    // ===== CURSOR TRAIL =====
    const initCursorTrail = () => {
        // Only on desktop
        if (window.matchMedia('(pointer: coarse)').matches) return;
        
        const dots = [];
        const cursor = { x: 0, y: 0 };
        const dotCount = 5;
        
        for (let i = 0; i < dotCount; i++) {
            const dot = document.createElement('div');
            dot.className = 'cursor-trail';
            dot.style.cssText = `
                position: fixed;
                width: ${8 - i}px;
                height: ${8 - i}px;
                background: rgba(59, 130, 246, ${0.5 - i * 0.1});
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                transition: transform 0.15s ease;
            `;
            document.body.appendChild(dot);
            dots.push({ el: dot, x: 0, y: 0 });
        }
        
        document.addEventListener('mousemove', (e) => {
            cursor.x = e.clientX;
            cursor.y = e.clientY;
        });
        
        const animate = () => {
            dots.forEach((dot, index) => {
                const delay = (index + 1) * 0.08;
                dot.x += (cursor.x - dot.x) * delay;
                dot.y += (cursor.y - dot.y) * delay;
                dot.el.style.transform = `translate(${dot.x}px, ${dot.y}px)`;
            });
            requestAnimationFrame(animate);
        };
        
        animate();
    };

    // ===== BENTO GRID ANIMATIONS =====
    const initBentoGrid = () => {
        const bentoItems = document.querySelectorAll('.bento-item');
        
        const bentoObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                    bentoObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        bentoItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            bentoObserver.observe(item);
        });
    };

    // ===== LIQUID GLASS EFFECT =====
    const initLiquidGlass = () => {
        const glassElements = document.querySelectorAll('.liquid-glass, .liquid-glass-dark');
        
        glassElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                el.style.background = `
                    radial-gradient(circle at ${x}% ${y}%, 
                    rgba(255, 255, 255, 0.8) 0%, 
                    rgba(255, 255, 255, 0.4) 50%, 
                    rgba(255, 255, 255, 0.1) 100%)
                `;
            });
        });
    };

    // ===== HERO ANIMATIONS =====
    const initHeroAnimations = () => {
        const hero = document.querySelector('.hero-2025');
        if (!hero) return;

        // Animate hero elements on load
        const heroElements = hero.querySelectorAll('.hero-2025-badge, .hero-2025-title, .hero-2025-subtitle, .hero-buttons, .hero-2025-stats');
        
        heroElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                el.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 200 + (index * 150));
        });
    };

    // ===== ACCORDION ANIMATION =====
    const initAccordion = () => {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            if (!question || !answer) return;
            
            answer.style.maxHeight = '0';
            answer.style.overflow = 'hidden';
            answer.style.transition = 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            
            question.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');
                
                // Close all
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    if (otherAnswer) otherAnswer.style.maxHeight = '0';
                });
                
                // Open clicked if it was closed
                if (!isOpen) {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        });
    };

    // ===== TYPING EFFECT =====
    const initTypingEffect = () => {
        const typingElements = document.querySelectorAll('.typing-effect');
        
        typingElements.forEach(el => {
            const text = el.getAttribute('data-text') || el.innerText;
            el.innerText = '';
            
            let index = 0;
            const type = () => {
                if (index < text.length) {
                    el.innerText += text.charAt(index);
                    index++;
                    setTimeout(type, 100);
                }
            };
            
            // Start typing when visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        type();
                        observer.unobserve(el);
                    }
                });
            });
            
            observer.observe(el);
        });
    };

    // ===== LOADING SKELETON =====
    const initSkeletonLoading = () => {
        const skeletons = document.querySelectorAll('.skeleton-2025');
        
        // Simulate loading completion after 2 seconds
        setTimeout(() => {
            skeletons.forEach(skeleton => {
                skeleton.classList.remove('skeleton-2025');
                skeleton.style.background = '';
                skeleton.style.animation = '';
            });
        }, 2000);
    };

    // ===== PERFORMANCE UTILITIES =====
    const throttle = (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    const debounce = (func, wait) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    // ===== INITIALIZE ALL =====
    const init = () => {
        initScrollReveal();
        initNavScroll();
        initMagneticButtons();
        initSpotlight();
        initParallax();
        initSmoothScroll();
        initStaggerAnimation();
        initCounterAnimation();
        initTiltEffect();
        initTextScramble();
        // initCursorTrail(); // Optional - enable if desired
        initBentoGrid();
        initLiquidGlass();
        initHeroAnimations();
        initAccordion();
        initTypingEffect();
        initSkeletonLoading();
        
        console.log('Modern 2025 UI initialized ✨');
    };

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Re-initialize on dynamic content load
    window.ModernUI = {
        refresh: init,
        scrollReveal: initScrollReveal,
        counter: initCounterAnimation
    };

})();
