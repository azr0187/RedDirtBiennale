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

    // Live countdown to the opening (times are fixed to Camp Hill, Central time)
    var cd = document.getElementById("countdown");
    if (cd) {
        var start = new Date(cd.getAttribute("data-start")).getTime();
        var end = new Date(cd.getAttribute("data-end")).getTime();
        var label = cd.querySelector(".countdown-label");
        var units = {};
        cd.querySelectorAll("[data-unit]").forEach(function (el) {
            units[el.getAttribute("data-unit")] = el;
        });
        var pad = function (n) { return (n < 10 ? "0" : "") + n; };

        function tick() {
            var now = Date.now();
            if (window.RDB_PREVIEW_NOW) {   // preview page: pretend it is that time on the 14th
                var pm = String(window.RDB_PREVIEW_NOW).match(/(\d{1,2}):(\d{2})/);
                if (pm) { now = new Date("2026-11-14T" + (pm[1].length < 2 ? "0" : "") + pm[1] + ":" + pm[2] + ":00-06:00").getTime(); }
            }
            if (now >= end) {
                cd.classList.add("is-over");
                label.textContent = "RDB ONE has wrapped. See you at RDB TWO.";
                return;
            }
            if (now >= start) {
                cd.classList.add("is-live");
                label.textContent = "Happening now in Camp Hill";
                return;
            }
            var left = Math.floor((start - now) / 1000);
            units.days.textContent = Math.floor(left / 86400);
            units.hours.textContent = pad(Math.floor(left % 86400 / 3600));
            units.minutes.textContent = pad(Math.floor(left % 3600 / 60));
            units.seconds.textContent = pad(left % 60);
            setTimeout(tick, 1000 - (now % 1000));
        }
        tick();
    }

    // Live schedule: on November 14 (Camp Hill time) mark what is past, on
    // now, and up next, and draw a "now" line across every time grid.
    // Preview any moment of the day with ?now=HH:MM (24-hour) on schedule.html.
    var tracks = document.querySelectorAll(".tt-track, .ev-track");
    if (tracks.length) {
        var DAY_START = 9 * 60, DAY_END = 20 * 60;   // the grids run 9 AM – 8 PM
        var EVENT_DATE = "2026-11-14";
        function previewTime() {
            // A simulated time of day: window.RDB_PREVIEW_NOW ("HH:MM") or ?now=HH:MM / #now=HH:MM
            var src = window.RDB_PREVIEW_NOW || (location.search + location.hash);
            var m = String(src).match(/(\d{1,2}):(\d{2})/);
            return m ? (+m[1]) * 60 + (+m[2]) : null;
        }
        var preview = previewTime();

        function campHillNow() {
            // Returns { date: "YYYY-MM-DD", minutes } in America/Chicago
            preview = previewTime();
            if (preview !== null) {
                return { date: EVENT_DATE, minutes: preview };
            }
            try {
                var parts = new Intl.DateTimeFormat("en-US", {
                    timeZone: "America/Chicago", hour12: false,
                    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
                }).formatToParts(new Date());
                var g = {};
                parts.forEach(function (p) { g[p.type] = p.value; });
                return { date: g.year + "-" + g.month + "-" + g.day, minutes: (+g.hour % 24) * 60 + (+g.minute) };
            } catch (e) {
                var d = new Date();
                return { date: d.toISOString().slice(0, 10), minutes: d.getHours() * 60 + d.getMinutes() };
            }
        }

        function fmtTime(m) {
            var h = Math.floor(m / 60), mm = m % 60, ap = h < 12 ? "AM" : "PM";
            h = h % 12 || 12;
            return h + (mm ? ":" + (mm < 10 ? "0" : "") + mm : "") + " " + ap;
        }

        var strip = document.getElementById("now-strip");
        var list = document.getElementById("now-list");
        var clock = document.getElementById("now-clock");

        function updateLive() {
            var t = campHillNow();
            var live = t.date === EVENT_DATE && t.minutes >= DAY_START && t.minutes <= DAY_END;
            document.documentElement.classList.toggle("is-live", live);
            if (strip) { strip.classList.toggle("live", live); }
            if (!live) { return; }

            var now = t.minutes;
            var pct = Math.min(Math.max((now - DAY_START) / (DAY_END - DAY_START) * 100, 0), 100);
            document.documentElement.style.setProperty("--now", pct.toFixed(3) + "%");

            // Timetable blocks
            var onNow = [];
            document.querySelectorAll(".blk[data-start]").forEach(function (el) {
                var s = +el.getAttribute("data-start"), e = +el.getAttribute("data-end");
                el.classList.toggle("is-past", e <= now);
                el.classList.toggle("is-now", s <= now && now < e);
                if (s <= now && now < e && !el.classList.contains("blk-gap")) {
                    onNow.push({ site: el.getAttribute("data-site"), href: el.getAttribute("href"),
                                 name: el.textContent.trim(), end: e });
                }
            });

            // Site lists: past / now / the first upcoming event per site
            document.querySelectorAll(".events").forEach(function (ol) {
                var nextFound = false;
                ol.querySelectorAll(".ev[data-start]").forEach(function (li) {
                    var s = +li.getAttribute("data-start"), e = +li.getAttribute("data-end");
                    var tag = li.querySelector(".ev-state");
                    if (!tag) {
                        tag = document.createElement("span");
                        tag.className = "ev-state";
                        li.querySelector(".ev-title").appendChild(tag);
                    }
                    var isNow = s <= now && now < e;
                    var isNext = !nextFound && s > now;
                    if (isNext) { nextFound = true; }
                    li.classList.toggle("is-past", e <= now);
                    li.classList.toggle("is-now", isNow);
                    li.classList.toggle("is-next", isNext);
                    tag.textContent = isNow ? "Now" : (isNext ? "Up next · " + fmtTime(s) : "");
                });
            });

            // The strip
            if (list) {
                if (clock) { clock.textContent = fmtTime(now) + (preview !== null ? " · preview" : ""); }
                list.innerHTML = "";
                if (!onNow.length) {
                    var li = document.createElement("li");
                    li.className = "now-empty";
                    li.textContent = now < DAY_START ? "Doors open at 9 AM." : "Nothing on at this moment. See what is coming up below.";
                    list.appendChild(li);
                }
                onNow.forEach(function (ev) {
                    var li = document.createElement("li");
                    var a = document.createElement("a");
                    a.href = ev.href;
                    a.textContent = ev.name;
                    var sp = document.createElement("span");
                    sp.textContent = ev.site + " · until " + fmtTime(ev.end);
                    li.appendChild(a);
                    li.appendChild(sp);
                    list.appendChild(li);
                });
            }
        }

        updateLive();
        window.rdbUpdateLive = updateLive;
        if (preview === null) { setInterval(updateLive, 30000); }
    }

    // Floating pages: links with data-dialog open the matching <dialog>.
    document.querySelectorAll("[data-dialog]").forEach(function (link) {
        link.addEventListener("click", function (e) {
            var dlg = document.getElementById(link.getAttribute("data-dialog"));
            if (!dlg || typeof dlg.showModal !== "function") { return; }
            e.preventDefault();
            dlg.showModal();
            dlg.scrollTop = 0;
        });
    });
    document.querySelectorAll("dialog").forEach(function (dlg) {
        // Click on the dark backdrop closes it
        dlg.addEventListener("click", function (e) {
            if (e.target === dlg) { dlg.close(); }
        });
    });

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
