document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Navigation Toggle ---
    const mobileButton = document.querySelector('.mobile-icon');
    const header = document.querySelector('.site-header');
    const mobileNavContainer = document.querySelector('.mobile-nav-container');
    const mobileNav = document.querySelector('.mobile-nav');
    const desktopNav = document.querySelector('.header-nav');

    if (mobileButton && header && mobileNavContainer && mobileNav && desktopNav) {
        // Clone desktop nav items to mobile nav
        // NOTE: This simple clone copies dropdown HTML but hover interactions won't work.
        //       Clicking parent items might navigate instead of opening submenus.
        //       Proper mobile dropdown handling requires additional JS event listeners
        //       within the mobile nav context to toggle dropdown visibility on click.
        mobileNav.innerHTML = desktopNav.innerHTML;

        mobileButton.addEventListener('click', () => {
            const isOpen = header.classList.toggle('nav-open');
            mobileButton.setAttribute('aria-expanded', isOpen);

            // Optional: Prevent body scroll when nav is open
            // Consider using a class on <body> for more robust scroll locking
            document.body.style.overflow = isOpen ? 'hidden' : '';

        });

        // Close mobile nav if clicking outside of it (optional but good UX)
        document.addEventListener('click', (event) => {
            if (header.classList.contains('nav-open')) {
                // Check if the click is outside the button and the mobile nav container
                const isClickInsideHeader = header.contains(event.target); // Check within entire header
                if (!isClickInsideHeader) {
                    header.classList.remove('nav-open');
                    mobileButton.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            }
        });

        // Close mobile nav when a link inside it is clicked (that is not a parent toggle)
        // NOTE: This might need adjustment if mobile dropdown toggles are implemented
        mobileNav.addEventListener('click', (event) => {
             const link = event.target.closest('a');
             // Only close if it's a real link, not potentially a dropdown toggle anchor
             if (link && link.closest('.nav-item') && !link.closest('.has-dropdown')) { // Simple check - adjust if needed
                 header.classList.remove('nav-open');
                 mobileButton.setAttribute('aria-expanded', 'false');
                 document.body.style.overflow = '';
             }
             // Add logic here to handle clicks on '.has-dropdown > a' to toggle sibling '.nav-dropdown' display
        });
    }

    // --- Smooth Scrolling for Skip Links ---
    const skipLinks = document.querySelectorAll('.skip-link');
    skipLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Set focus to the target element for accessibility after scrolling
                targetElement.setAttribute('tabindex', '-1');
                // Timeout ensures focus happens after scroll animation
                setTimeout(() => {
                     targetElement.focus({ preventScroll: true }); // preventScroll stops page jumping again
                     targetElement.addEventListener('blur', () => {
                         targetElement.removeAttribute('tabindex');
                     }, { once: true });
                }, 50); // Adjust timeout if needed
            }
        });
    });

    // --- Enhanced Fade-in Animation on Scroll ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add 'is-visible' class when element enters viewport
                    entry.target.classList.add('is-visible');
                    // Optional: Unobserve after animation to save resources
                    observer.unobserve(entry.target);
                }
                // No 'else' needed if we only want the animation once
            });
        }, {
            threshold: 0.1, // Trigger when 10% of the element is visible
            // rootMargin: "0px 0px -50px 0px" // Optional: trigger slightly before it enters viewport
        });

        animatedElements.forEach(el => {
             observer.observe(el);
        });
    } else {
        // Fallback for older browsers: just show elements immediately
        animatedElements.forEach(el => {
            el.classList.add('is-visible'); // Add class directly to make visible
            el.classList.remove('animate-on-scroll'); // Remove animation class if no observer
        });
    }

    // --- Technical Term Formatting ---
    const contentAreas = document.querySelectorAll('.reading-column p, .reading-column li, .reading-column h1, .reading-column h2, .reading-column h3, .post-title, .card-headline, blockquote p');
    const termRegex = /([\p{L}\s\d]+?)\s*(?:\(([\w\s.-]+)\))/gu;

    contentAreas.forEach(area => {
        const walker = document.createTreeWalker(area, NodeFilter.SHOW_TEXT, null, false);
        let node;
        const nodesToReplace = [];

        while(node = walker.nextNode()) {
            const text = node.nodeValue;
            let match;
            let lastIndex = 0;
            const fragments = [];
            termRegex.lastIndex = 0;

            while ((match = termRegex.exec(text)) !== null) {
                if (match.index > lastIndex) {
                    fragments.push(document.createTextNode(text.substring(lastIndex, match.index)));
                }
                const termSpan = document.createElement('span');
                termSpan.className = 'technical-term';
                termSpan.appendChild(document.createTextNode(match[1].trim() + ' (')); // Vietnamese part
                const englishSpan = document.createElement('span');
                englishSpan.className = 'english';
                englishSpan.textContent = match[2].trim(); // English part
                termSpan.appendChild(englishSpan);
                termSpan.appendChild(document.createTextNode(')'));
                fragments.push(termSpan);
                lastIndex = termRegex.lastIndex;
            }

            if (fragments.length > 0) {
                if (lastIndex < text.length) {
                    fragments.push(document.createTextNode(text.substring(lastIndex)));
                }
                nodesToReplace.push({ oldNode: node, newNodes: fragments });
            }
        } 

        nodesToReplace.forEach(replacement => {
            replacement.newNodes.forEach(newNode => {
                replacement.oldNode.parentNode.insertBefore(newNode, replacement.oldNode);
            });
            replacement.oldNode.parentNode.removeChild(replacement.oldNode);
        });
    });

}); // End DOMContentLoaded