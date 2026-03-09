document.addEventListener('DOMContentLoaded', () => {
    // Parallax effect for the hero image
    const heroImage = document.getElementById('parallax-img');

    if (heroImage) {
        window.addEventListener('scroll', () => {
            // Get scroll position
            const scrollY = window.scrollY;

            // Only apply effect if we are near the top of the page
            if (scrollY < window.innerHeight) {
                // Calculate subtle transform
                const yOffset = scrollY * -0.15; // move image up slightly as we scroll down

                // Apply transform without breaking the CSS float animation
                heroImage.style.transform = `translateY(${yOffset}px)`;
            }
        });
    }

    // Intersection Observer for Scroll Reveals
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach(el => observer.observe(el));
});
