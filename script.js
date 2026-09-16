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
});