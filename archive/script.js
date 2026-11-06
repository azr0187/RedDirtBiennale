// A simple message to show the script is loaded
console.log("Website successfully loaded! Hello from script.js!");

// Wait for the HTML document to fully load before running the interaction
document.addEventListener("DOMContentLoaded", function() {
    
    // Find the contact link by its ID
    const contactLink = document.getElementById("contact-link");
    
    // Add a click event to it
    if(contactLink) {
        contactLink.addEventListener("click", function() {
            alert("Thanks for reaching out! Your default email client will now open.");
        });
    }

    // Apple-style pinned crossfade: sections are stacked on top of each other
    // inside a sticky stage, and each one's opacity/scale/blur is driven
    // directly by how far the page has scrolled through the pinned zone.
    const pinScroll = document.querySelector(".pin-scroll");
    const panels = document.querySelectorAll(".pin-scroll .content");

    if (pinScroll && panels.length) {
        const count = panels.length;
        const halfWindow = count > 1 ? 1 / (count - 1) : 1;
        // Portion of each half-window that stays perfectly sharp before
        // the crossfade to the next section begins.
        const dwell = halfWindow * 0.45;

        function updatePanels() {
            const rect = pinScroll.getBoundingClientRect();
            const scrollableDistance = pinScroll.offsetHeight - window.innerHeight;
            const progress = scrollableDistance > 0
                ? Math.min(Math.max(-rect.top / scrollableDistance, 0), 1)
                : 0;

            panels.forEach(function(panel, i) {
                const center = count > 1 ? i / (count - 1) : 0;
                const distance = Math.abs(progress - center);
                const opacity = distance <= dwell
                    ? 1
                    : Math.max(1 - (distance - dwell) / (halfWindow - dwell), 0);
                const scale = 0.92 + 0.08 * opacity;
                const blur = (1 - opacity) * 10;

                panel.style.opacity = opacity;
                panel.style.transform = "scale(" + scale.toFixed(3) + ")";
                panel.style.filter = "blur(" + blur.toFixed(2) + "px)";
                panel.style.zIndex = Math.round(opacity * 100);
            });
        }

        let ticking = false;
        function onScroll() {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(function() {
                    updatePanels();
                    ticking = false;
                });
            }
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        updatePanels();
    }

    // Gallery carousel: a scroll-snap track that only moves when the visitor
    // uses the arrows, the dots, or swipes. It never auto-advances.
    const carousel = document.querySelector(".carousel");

    if (carousel) {
        const track = carousel.querySelector(".carousel-track");
        const slides = track.querySelectorAll(".carousel-slide");
        const dotsContainer = document.querySelector(".carousel-dots");
        const dots = [];
        let current = 0;

        // Wraps around, so "next" on the last image goes back to the first.
        function goTo(index) {
            const target = (index + slides.length) % slides.length;
            current = target;
            markDots();
            track.scrollTo({ left: target * track.clientWidth });
        }

        slides.forEach(function(slide, i) {
            // Blurred copy of the image that fills the space beside it on
            // wide screens.
            const img = slide.querySelector("img");
            const backdrop = img.cloneNode();
            backdrop.className = "carousel-backdrop";
            backdrop.alt = "";
            backdrop.setAttribute("aria-hidden", "true");
            slide.insertBefore(backdrop, img);

            const dot = document.createElement("button");
            dot.type = "button";
            dot.setAttribute("aria-label", "Go to image " + (i + 1));
            dot.addEventListener("click", function() {
                goTo(i);
            });
            dotsContainer.appendChild(dot);
            dots.push(dot);
        });

        function markDots() {
            dots.forEach(function(dot, i) {
                dot.setAttribute("aria-current", i === current ? "true" : "false");
            });
        }

        function updateDots() {
            current = Math.round(track.scrollLeft / track.clientWidth);
            markDots();
        }

        carousel.querySelector(".prev").addEventListener("click", function() {
            goTo(current - 1);
        });
        carousel.querySelector(".next").addEventListener("click", function() {
            goTo(current + 1);
        });
        track.addEventListener("scroll", updateDots, { passive: true });
        updateDots();
    }
});