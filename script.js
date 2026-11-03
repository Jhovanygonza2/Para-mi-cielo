const button = document.querySelector("#openLetter");
const envelope = document.querySelector("#carta");
const letter = document.querySelector("#letter");
const flap = document.querySelector(".flap");
const seal = document.querySelector(".seal");
const buttonLabel = button.querySelector(".button-label");
const buttonIcon = button.querySelector(".button-icon");
const particlesContainer = document.querySelector(".falling-particles");
const bouquet = document.querySelector(".bouquet");
const envelopeNote = document.querySelector(".envelope-note");

const alignBouquetStems = () => {
  const bouquetBounds = bouquet.getBoundingClientRect();
  const wrapBounds = bouquet.querySelector(".bouquet-wrap").getBoundingClientRect();
  const entryPositions = [0.08, 0.19, 0.3, 0.4, 0.5, 0.6, 0.7, 0.81, 0.92];
  const wrapLeft = wrapBounds.left - bouquetBounds.left;
  const targetY = wrapBounds.top - bouquetBounds.top + 18;

  const flowers = [...bouquet.querySelectorAll(".flower")].sort((first, second) => (
    first.getBoundingClientRect().left - second.getBoundingClientRect().left
  ));

  flowers.forEach((flower, index) => {
    const flowerBounds = flower.getBoundingClientRect();
    const stem = flower.querySelector(".stem");
    const startX = flowerBounds.left - bouquetBounds.left + flowerBounds.width / 2;
    const startY = flowerBounds.top - bouquetBounds.top + flowerBounds.width * (24 / 36) - 2;
    const targetX = wrapLeft + wrapBounds.width * entryPositions[index];
    const offsetX = targetX - startX;
    const offsetY = targetY - startY;

    stem.style.setProperty("--stem-length", `${Math.hypot(offsetX, offsetY)}px`);
    stem.style.setProperty("--stem-angle", `${-Math.atan2(offsetX, offsetY) * 180 / Math.PI}deg`);
  });
};

alignBouquetStems();
window.addEventListener("resize", alignBouquetStems);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let openingAnimation;
let letterIsOpen = false;

if (window.gsap && !reduceMotion) {
  const { gsap } = window;

  gsap.from(".hero-copy, .garden, .letter-section", {
    autoAlpha: 0,
    y: 18,
    duration: 0.9,
    stagger: 0.13,
    ease: "power2.out"
  });

  gsap.from(".tulip", {
    scale: 0.55,
    autoAlpha: 0,
    duration: 0.9,
    stagger: 0.12,
    delay: 0.45,
    ease: "back.out(1.7)"
  });

  gsap.from(".stem", {
    scaleY: 0,
    duration: 0.85,
    stagger: 0.12,
    delay: 0.45,
    ease: "power2.out"
  });

  gsap.utils.toArray(".tulip").forEach((tulip, index) => {
    gsap.to(tulip, {
      rotation: index % 2 === 0 ? "-=5" : "+=5",
      duration: 3.6 + index * 0.28,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      transformOrigin: "50% 100%"
    });
  });

  gsap.from(".bouquet-wrap, .bouquet-bow", {
    autoAlpha: 0,
    duration: 0.6,
    delay: 0.95,
    stagger: 0.12,
    ease: "power2.out"
  });

  const particleSymbols = [
    { symbol: "♡", type: "is-heart" },
    { symbol: "♥", type: "is-heart" },
    { symbol: "✧", type: "is-glint" },
    { symbol: "♥", type: "is-heart" }
  ];

  for (let index = 0; index < 20; index += 1) {
    const particle = document.createElement("span");
    const particleType = particleSymbols[index % particleSymbols.length];
    const duration = 8 + Math.random() * 6;

    particle.className = `falling-particle ${particleType.type}`;
    particle.textContent = particleType.symbol;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.fontSize = `${17 + Math.random() * 12}px`;
    particlesContainer.append(particle);

    gsap.timeline({
      repeat: -1,
      repeatRefresh: true,
      delay: Math.random() * 3.5
    })
      .fromTo(particle, {
        y: -50,
        x: 0,
        autoAlpha: 0,
        rotation: -25
      }, {
        y: () => window.innerHeight + 70,
        x: () => Math.random() * 130 - 65,
        rotation: () => Math.random() * 180 - 90,
        duration,
        ease: "none"
      }, 0)
      .to(particle, {
        autoAlpha: 0.92,
        duration: 0.45,
        ease: "power1.out"
      }, 0.08)
      .to(particle, {
        autoAlpha: 0,
        duration: 1.2,
        ease: "power1.in"
      }, duration - 1.2);
  }

  openingAnimation = gsap.timeline({
    paused: true,
    onComplete: () => envelope.classList.remove("is-animating"),
    onReverseComplete: () => {
      gsap.set([flap, letter, seal, envelopeNote], { clearProps: "transform,opacity,visibility,zIndex" });
      envelope.classList.remove("is-open");
      letter.setAttribute("aria-hidden", "true");
      requestAnimationFrame(() => {
        if (!letterIsOpen) {
          envelope.classList.remove("is-animating");
        }
      });
    }
  });

  openingAnimation
    .set(letter, { visibility: "visible", zIndex: 6 })
    .set(flap, { rotateX: 0, transformOrigin: "50% 0%", zIndex: 4 }, 0)
    .to(flap, {
      rotateX: 180,
      duration: 0.72,
      ease: "power2.inOut"
    }, 0)
    .to(seal, {
      autoAlpha: 0,
      duration: 0.24,
      ease: "power1.out"
    }, 0.06)
    .to(envelopeNote, {
      autoAlpha: 0,
      y: 4,
      duration: 0.2,
      ease: "power1.out"
    }, 0.06)
    .fromTo(letter, {
      y: 28,
      autoAlpha: 0,
      scale: 0.98,
      rotateX: -2
    }, {
      y: -45,
      autoAlpha: 1,
      scale: 1,
      rotateX: 0,
      duration: 0.82,
      ease: "power2.out"
    }, 0.2)
    .set(flap, { zIndex: 1 }, 0.72);
}

button.addEventListener("click", () => {
  letterIsOpen = !letterIsOpen;
  button.setAttribute("aria-expanded", String(letterIsOpen));
  buttonLabel.textContent = letterIsOpen ? "Cerrar mi carta" : "Abrir mi carta";
  buttonIcon.textContent = letterIsOpen ? "♡" : "✿";

  if (openingAnimation) {
    envelope.classList.add("is-animating");

    if (letterIsOpen) {
      envelope.classList.add("is-open");
      letter.setAttribute("aria-hidden", "false");
      openingAnimation.play();
    } else {
      openingAnimation.reverse();
    }

    return;
  }

  envelope.classList.toggle("is-open", letterIsOpen);
  letter.setAttribute("aria-hidden", String(!letterIsOpen));
});

document.querySelector(".envelope").addEventListener("click", () => {
  button.click();
});
