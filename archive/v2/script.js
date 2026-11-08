document.addEventListener("DOMContentLoaded", function () {

    // Slim top bar: shown once the big wordmark has scrolled out of view.
    var topbar = document.getElementById("topbar");
    var wordmark = document.querySelector(".wordmark");

    if (topbar && wordmark && "IntersectionObserver" in window) {
        var observer = new IntersectionObserver(function (entries) {
            var hidden = !entries[0].isIntersecting;
            topbar.classList.toggle("is-visible", hidden);
            topbar.setAttribute("aria-hidden", hidden ? "false" : "true");
        }, { threshold: 0 });
        observer.observe(wordmark);
    }

    // Gallery carousel: a scroll-snap track that only moves when the visitor
    // uses the arrows, the dots, or swipes. It never auto-advances.
    var carousel = document.querySelector(".carousel");

    if (carousel) {
        var track = carousel.querySelector(".carousel-track");
        var slides = track.querySelectorAll(".carousel-slide");
        var dotsContainer = document.querySelector(".carousel-dots");
        var counter = document.querySelector(".carousel-current");
        var dots = [];
        var current = 0;

        function markDots() {
            dots.forEach(function (dot, i) {
                dot.setAttribute("aria-current", i === current ? "true" : "false");
            });
            if (counter) {
                counter.textContent = current + 1;
            }
        }

        // Wraps around, so "next" on the last image goes back to the first.
        function goTo(index) {
            current = (index + slides.length) % slides.length;
            markDots();
            track.scrollTo({ left: slides[current].offsetLeft - track.offsetLeft });
        }

        // Index of the slide whose left edge is nearest the track's left edge.
        function nearestSlide() {
            var best = 0;
            var bestDist = Infinity;
            slides.forEach(function (slide, i) {
                var dist = Math.abs((slide.offsetLeft - track.offsetLeft) - track.scrollLeft);
                if (dist < bestDist) { bestDist = dist; best = i; }
            });
            return best;
        }

        slides.forEach(function (_slide, i) {
            var dot = document.createElement("button");
            dot.type = "button";
            dot.setAttribute("aria-label", "Go to image " + (i + 1));
            dot.addEventListener("click", function () {
                goTo(i);
            });
            dotsContainer.appendChild(dot);
            dots.push(dot);
        });

        function updateDots() {
            current = nearestSlide();
            markDots();
        }

        document.querySelector(".carousel-btn.prev").addEventListener("click", function () {
            goTo(current - 1);
        });
        document.querySelector(".carousel-btn.next").addEventListener("click", function () {
            goTo(current + 1);
        });
        track.addEventListener("scroll", updateDots, { passive: true });
        track.addEventListener("keydown", function (e) {
            if (e.key === "ArrowRight") { goTo(current + 1); }
            if (e.key === "ArrowLeft") { goTo(current - 1); }
        });
        updateDots();
    }
});
