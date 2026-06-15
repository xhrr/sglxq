/**
 * ============================================================
 *  摄影师主页 — 主脚本
 *  依赖: config.js（需在之前加载）
 *  功能: 配置驱动渲染 + 交互行为
 * ============================================================
 */
(function () {
    'use strict';

    const C = SITE_CONFIG;

    /* ===================================================================
       1. 配置驱动渲染
       =================================================================== */

    function initContent() {
        document.title = C.photographer.name + ' | ' + C.photographer.tagline;

        // Navigation
        setText('.nav__logo', C.photographer.nameEn);

        // Hero
        setText('.hero__name', C.photographer.name);
        setText('.hero__tagline', C.photographer.tagline);
        setText('.hero__scroll span', C.hero.scrollHint);
        setImage('.hero__bg img', C.hero.image);

        // Works
        renderWorks();

        // About
        renderAbout();

        // Footer
        setText('.footer__brand', C.photographer.nameEn);
        setText('.footer__copy', C.footer.copyright);
        renderSocialLinks();
    }

    /* ===================================================================
       2. 渲染函数
       =================================================================== */

    function renderWorks() {
        const grid = document.getElementById('worksGrid');
        if (!grid || !C.works.items) return;

        grid.innerHTML = C.works.items.map((item, index) => {
            const layoutClass = 'work-card--' + (item.layout || 'default');
            const count = (item.images && item.images.length) || 0;
            const countText = count > 0 ? ` · ${count} 张` : '';

            return `
                <a href="/gallery.html?work=${index}" class="work-card ${layoutClass}" data-delay="${(index * 0.1).toFixed(1)}">
                    <img class="work-card__image" src="${esc(item.image)}" alt="" loading="lazy"
                        onerror="this.style.display='none';this.parentNode.classList.add('img-placeholder');this.parentNode.setAttribute('data-placeholder','[ 图片占位 ]')">
                    <div class="work-card__overlay">
                        <span class="work-card__title">${esc(item.title)}</span>
                        <span class="work-card__category">${esc(item.category)}${countText}</span>
                    </div>
                </a>`;
        }).join('');
    }

    function renderAbout() {
        const section = document.getElementById('about');
        const navLink = document.querySelector('.nav__link[href="#about"]');
        const navItem = navLink ? navLink.closest('li') : null;

        if (!section) return;

        if (C.about.visible === false) {
            section.style.display = 'none';
            if (navItem) navItem.style.display = 'none';
            return;
        }

        section.style.display = '';
        if (navItem) navItem.style.display = '';

        setText('.about-content__name', C.photographer.name);
        setText('.about-content__role', C.about.role);
        renderAboutBio();
        renderAboutStats();
        setImage('.about-image img', C.aboutImage);
    }

    function renderAboutBio() {
        const container = document.querySelector('.about-content__bio');
        if (!container || !C.about.bio) return;
        container.innerHTML = C.about.bio.map(p => `<p>${esc(p)}</p>`).join('');
    }

    function renderAboutStats() {
        const container = document.querySelector('.about-content__detail');
        if (!container || !C.about.stats) return;
        container.innerHTML = C.about.stats.map(stat => `
            <div class="about-content__detail-item">
                <p class="about-content__detail-label">${esc(stat.label)}</p>
                <p class="about-content__detail-value">${esc(stat.value)}</p>
            </div>
        `).join('');
    }

    function renderSocialLinks() {
        const container = document.querySelector('.footer__social');
        if (!container || !C.social.links) return;
        container.innerHTML = C.social.links.map(link =>
            `<a href="${esc(link.url)}" target="_blank" rel="noopener">${esc(link.name)}</a>`
        ).join('');
    }

    /* ===================================================================
       3. 交互行为
       =================================================================== */

    // Navigation scroll effect
    const nav = document.getElementById('nav');

    function handleNavScroll() {
        const scrolled = window.scrollY > 80;
        nav.classList.toggle('nav--visible', scrolled);
        nav.classList.toggle('nav--scrolled', scrolled);
    }
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();

    // Mobile nav toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    function closeMobileNav() {
        navToggle.classList.remove('nav__toggle--active');
        navLinks.classList.remove('nav__links--open');
    }

    navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navToggle.classList.toggle('nav__toggle--active');
        navLinks.classList.toggle('nav__links--open');
    });

    navLinks.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', closeMobileNav);
    });

    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && navLinks.classList.contains('nav__links--open')) {
            closeMobileNav();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('nav__links--open')) {
            closeMobileNav();
        }
    });

    // Intersection Observer for reveal animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;

            if (el.classList.contains('section__header')) {
                el.classList.add('section__header--visible');
            } else if (el.classList.contains('work-card')) {
                const delay = parseFloat(el.dataset.delay) || 0;
                setTimeout(() => el.classList.add('work-card--visible'), delay * 1000);
            } else if (el.classList.contains('about-image')) {
                el.classList.add('about-image--visible');
            } else if (el.classList.contains('about-content')) {
                el.classList.add('about-content--visible');
            } else if (el.classList.contains('reveal')) {
                el.classList.add('reveal--visible');
            }
            observer.unobserve(el);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    function observeElements() {
        document.querySelectorAll('.section__header, .work-card').forEach(el => observer.observe(el));
        const aboutImg = document.querySelector('.about-image');
        const aboutContent = document.querySelector('.about-content');
        if (aboutImg) observer.observe(aboutImg);
        if (aboutContent) observer.observe(aboutContent);
    }

    // Hero parallax
    const hero = document.getElementById('hero');
    const heroBg = hero && hero.querySelector('.hero__bg');

    if (heroBg) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const heroH = hero.offsetHeight;
            if (scrollY <= heroH) {
                heroBg.style.transform = `translateY(${scrollY * 0.4}px)`;
                heroBg.style.opacity = 1 - (scrollY / heroH) * 0.3;
            }
        }, { passive: true });
    }

    /* ===================================================================
       4. 工具函数
       =================================================================== */

    function setText(selector, text) {
        const el = document.querySelector(selector);
        if (el && text !== undefined) el.textContent = text;
    }

    function setImage(selector, src) {
        const img = document.querySelector(selector);
        if (!img || !src) return;
        img.src = src;
        img.addEventListener('error', () => {
            img.style.display = 'none';
            const wrapper = img.parentNode;
            if (wrapper) {
                wrapper.classList.add('img-placeholder');
                wrapper.setAttribute('data-placeholder', '[ 图片占位 ]');
            }
        });
    }

    function esc(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    /* ===================================================================
       5. 启动
       =================================================================== */

    initContent();
    requestAnimationFrame(() => requestAnimationFrame(observeElements));

})();
