(function () {
  "use strict";

  // Mobile menu
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      nav.classList.toggle("is-open", open);
    });
  }

  // Modal dialogs: lock page scroll while open, close on backdrop click.
  // Padding replaces the hidden scrollbar so the page doesn't jump sideways.
  var root = document.documentElement;
  function lockScroll() {
    var scrollbar = window.innerWidth - root.clientWidth;
    if (scrollbar > 0) root.style.paddingRight = scrollbar + "px";
    root.classList.add("modal-open");
  }
  function unlockScroll() {
    root.classList.remove("modal-open");
    root.style.paddingRight = "";
  }
  function setupDialog(dialog) {
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", unlockScroll);
  }
  function openDialog(dialog) {
    lockScroll();
    dialog.showModal();
  }

  // Provider bio popups
  document.querySelectorAll("[data-dialog]").forEach(function (btn) {
    var dialog = document.getElementById(btn.getAttribute("data-dialog"));
    if (!dialog || typeof dialog.showModal !== "function") return;
    setupDialog(dialog);
    btn.addEventListener("click", function () { openDialog(dialog); });
  });

  // Gallery lightbox
  var lightbox = document.getElementById("lightbox");
  if (lightbox && typeof lightbox.showModal === "function") {
    var lightboxImg = lightbox.querySelector("img");
    setupDialog(lightbox);
    document.querySelectorAll("[data-lightbox]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var img = link.querySelector("img");
        lightboxImg.src = link.href;
        lightboxImg.alt = img ? img.alt : "";
        openDialog(lightbox);
      });
    });
  }

  // Testimonials carousel (native horizontal scroll with snap)
  document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
    var track = carousel.querySelector("[data-carousel-track]");
    var dots = carousel.querySelector("[data-carousel-dots]");
    var prev = carousel.querySelector("[data-carousel-prev]");
    var next = carousel.querySelector("[data-carousel-next]");
    var items = track.children;

    function step() {
      return items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : track.clientWidth;
    }
    function perView() {
      return Math.max(1, Math.round(track.clientWidth / step()));
    }
    function pageCount() {
      return Math.max(1, items.length - perView() + 1);
    }
    function current() {
      return Math.round(track.scrollLeft / step());
    }
    function goTo(i) {
      var n = pageCount();
      i = (i + n) % n;
      track.scrollTo({ left: i * step() });
    }

    function renderDots() {
      dots.textContent = "";
      var n = pageCount();
      for (var i = 0; i < n; i++) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Go to testimonial " + (i + 1));
        b.addEventListener("click", goTo.bind(null, i));
        dots.appendChild(b);
      }
      var hide = n <= 1;
      carousel.querySelector(".carousel-controls").hidden = hide;
      updateDots();
    }
    function updateDots() {
      var c = current();
      Array.prototype.forEach.call(dots.children, function (b, i) {
        b.setAttribute("aria-current", i === c ? "true" : "false");
      });
    }

    prev.addEventListener("click", function () { goTo(current() - 1); });
    next.addEventListener("click", function () { goTo(current() + 1); });

    var t;
    track.addEventListener("scroll", function () {
      clearTimeout(t);
      t = setTimeout(updateDots, 60);
    });
    window.addEventListener("resize", renderDots);
    renderDots();
  });
})();
