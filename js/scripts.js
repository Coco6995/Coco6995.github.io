/*!
* Start Bootstrap - Resume v7.0.6 (https://startbootstrap.com/theme/resume)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-resume/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const sideNav = document.body.querySelector('#sideNav');
    if (sideNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#sideNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    const pageIndicator = document.querySelector('#pageIndicator');
    if (pageIndicator) {
        const indicatorGradient = pageIndicator.querySelector('.page-indicator__gradient');
        const indicatorDot = pageIndicator.querySelector('.page-indicator__dot');
        const indicatorLinks = Array.from(pageIndicator.querySelectorAll('.page-indicator__link'));
        const sections = indicatorLinks
            .map(link => document.querySelector(link.getAttribute('href')))
            .filter(Boolean);
        let scrollAnimationId = 0;
        let indicatorUpdateId = 0;
        const syncIndicatorGeometry = () => {
            if (window.matchMedia('(min-width: 992px)').matches) {
                const navigationBounds = document.querySelector('#sideNav .navbar-nav').getBoundingClientRect();
                pageIndicator.style.top = `${navigationBounds.top}px`;
                pageIndicator.style.height = `${navigationBounds.height}px`;
            } else {
                pageIndicator.style.removeProperty('top');
                pageIndicator.style.removeProperty('height');
            }
        };
        const setActiveSection = sectionId => {
            const activeLink = indicatorLinks.find(link => link.hash === `#${sectionId}`);
            if (!activeLink || activeLink.classList.contains('is-active')) {
                return;
            }

            indicatorLinks.forEach(link => {
                const isActive = link.hash === `#${sectionId}`;
                link.classList.toggle('is-active', isActive);
                if (isActive) {
                    link.setAttribute('aria-current', 'location');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        };

        const updateIndicatorFromViewport = () => {
            indicatorUpdateId = 0;
            const centerY = window.innerHeight / 2;
            const currentSection = sections.reduce((closestSection, section) => {
                const bounds = section.getBoundingClientRect();
                const distance = bounds.top <= centerY && bounds.bottom >= centerY
                    ? 0
                    : Math.min(Math.abs(bounds.top - centerY), Math.abs(bounds.bottom - centerY));
                if (!closestSection || distance < closestSection.distance) {
                    return { section, distance };
                }
                return closestSection;
            }, null);

            if (currentSection) {
                setActiveSection(currentSection.section.id);
            }

            const viewportCenter = window.scrollY + centerY;
            const sectionCenters = sections.map(section => {
                const bounds = section.getBoundingClientRect();
                return window.scrollY + bounds.top + bounds.height / 2;
            });
            let lowerIndex = 0;
            while (lowerIndex < sectionCenters.length - 1 && viewportCenter > sectionCenters[lowerIndex + 1]) {
                lowerIndex += 1;
            }
            const upperIndex = Math.min(lowerIndex + 1, sectionCenters.length - 1);
            const sectionDistance = sectionCenters[upperIndex] - sectionCenters[lowerIndex];
            const sectionProgress = sectionDistance > 0
                ? Math.max(0, Math.min(1, (viewportCenter - sectionCenters[lowerIndex]) / sectionDistance))
                : 0;
            const lowerLinkBounds = indicatorLinks[lowerIndex].getBoundingClientRect();
            const upperLinkBounds = indicatorLinks[upperIndex].getBoundingClientRect();
            const indicatorBounds = pageIndicator.getBoundingClientRect();
            const lowerLinkCenter = lowerLinkBounds.top + lowerLinkBounds.height / 2;
            const upperLinkCenter = upperLinkBounds.top + upperLinkBounds.height / 2;
            const markerCenter = lowerLinkCenter + (upperLinkCenter - lowerLinkCenter) * sectionProgress;
            const markerTop = markerCenter - indicatorBounds.top;
            indicatorDot.style.top = `${markerTop - 7}px`;
            indicatorGradient.style.top = `${markerTop - 28}px`;
        };
        const scheduleIndicatorUpdate = () => {
            if (!indicatorUpdateId) {
                indicatorUpdateId = requestAnimationFrame(updateIndicatorFromViewport);
            }
        };

        const navigateToSection = link => {
            const target = document.querySelector(link.hash);
            if (!target) {
                return;
            }

            const targetPosition = target.getBoundingClientRect().top + window.scrollY;
            history.pushState(null, '', link.hash);
            cancelAnimationFrame(scrollAnimationId);
            scrollAnimationId = 0;

            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                window.scrollTo(0, targetPosition);
                updateIndicatorFromViewport();
                return;
            }

            const startPosition = window.scrollY;
            const startTime = performance.now();
            const duration = 450;
            const animateScroll = currentTime => {
                const progress = Math.min((currentTime - startTime) / duration, 1);
                let lowerBound = 0;
                let upperBound = 1;
                let curvePosition = progress;
                for (let iteration = 0; iteration < 8; iteration += 1) {
                    const inversePosition = 1 - curvePosition;
                    const curveProgress = 3 * inversePosition ** 2 * curvePosition * 0.42
                        + 3 * inversePosition * curvePosition ** 2 * 0.58
                        + curvePosition ** 3;
                    if (curveProgress < progress) {
                        lowerBound = curvePosition;
                    } else {
                        upperBound = curvePosition;
                    }
                    curvePosition = (lowerBound + upperBound) / 2;
                }

                const inversePosition = 1 - curvePosition;
                const easedProgress = 3 * inversePosition * curvePosition ** 2 + curvePosition ** 3;
                window.scrollTo(0, startPosition + (targetPosition - startPosition) * easedProgress);
                updateIndicatorFromViewport();

                if (progress < 1) {
                    scrollAnimationId = requestAnimationFrame(animateScroll);
                } else {
                    scrollAnimationId = 0;
                    updateIndicatorFromViewport();
                }
            };

            scrollAnimationId = requestAnimationFrame(animateScroll);
        };

        syncIndicatorGeometry();
        window.addEventListener('resize', () => {
            syncIndicatorGeometry();
            updateIndicatorFromViewport();
        });

        updateIndicatorFromViewport();
        window.addEventListener('scroll', scheduleIndicatorUpdate, { passive: true });
        [sideNav, pageIndicator].forEach(navigation => {
            navigation?.addEventListener('click', clickEvent => {
                const link = clickEvent.target.closest('a[href^="#"]');
                if (link && document.querySelector(link.hash)) {
                    clickEvent.preventDefault();
                    navigateToSection(link);
                }
            });
        });
    }

});
