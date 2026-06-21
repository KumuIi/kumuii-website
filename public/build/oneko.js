// oneko.js — the classic cursor-chasing cat (adryd325 port of the PC-9801 "Neko").
// Public-domain sprite. Sourced live from the jsDelivr CDN mirror of the real repo.
// https://github.com/adryd325/oneko.js
(function oneko() {
  const isReduced = window.matchMedia(`(prefers-reduced-motion: reduce)`).matches;
  if (isReduced) return;

  const nekoEl = document.createElement("div");
  let nekoPosX = 32, nekoPosY = 32;
  let mousePosX = 0, mousePosY = 0;
  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleAnimationFrame = 0;
  const nekoSpeed = 10;
  const spriteSets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [[-5, 0],[-6, 0],[-7, 0]],
    scratchWallN: [[0, 0],[0, -1]],
    scratchWallS: [[-7, -1],[-6, -2]],
    scratchWallE: [[-2, -2],[-2, -3]],
    scratchWallW: [[-4, 0],[-4, -1]],
    tired: [[-3, -2]],
    sleeping: [[-2, 0],[-2, -1]],
    N: [[-1, -2],[-1, -3]],
    NE: [[0, -2],[0, -3]],
    E: [[-3, 0],[-3, -1]],
    SE: [[-5, -1],[-5, -2]],
    S: [[-6, -3],[-7, -2]],
    SW: [[-5, -3],[-6, -1]],
    W: [[-4, -2],[-4, -3]],
    NW: [[-1, 0],[-1, -1]],
  };

  function init() {
    nekoEl.id = "oneko";
    nekoEl.ariaHidden = true;
    nekoEl.style.width = "32px";
    nekoEl.style.height = "32px";
    nekoEl.style.position = "fixed";
    nekoEl.style.pointerEvents = "none";
    nekoEl.style.imageRendering = "pixelated";
    nekoEl.style.left = "16px";
    nekoEl.style.top = "16px";
    nekoEl.style.zIndex = "99999";
    nekoEl.style.backgroundImage =
      "url('https://cdn.jsdelivr.net/gh/adryd325/oneko.js@main/oneko.gif')";

    document.body.appendChild(nekoEl);

    document.addEventListener("mousemove", function (event) {
      mousePosX = event.clientX;
      mousePosY = event.clientY;
    });

    window.requestAnimationFrame(onAnimationFrame);
  }

  let lastFrameTimestamp;
  function onAnimationFrame(timestamp) {
    if (!nekoEl.isConnected) return;
    if (!lastFrameTimestamp) lastFrameTimestamp = timestamp;
    if (timestamp - lastFrameTimestamp > 100) {
      lastFrameTimestamp = timestamp;
      frame();
    }
    window.requestAnimationFrame(onAnimationFrame);
  }

  function setSprite(name, frame) {
    const sprite = spriteSets[name][frame % spriteSets[name].length];
    nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
  }

  function resetIdleAnimation() { idleAnimation = null; idleAnimationFrame = 0; }

  function idle() {
    idleTime += 1;
    if (idleTime > 10 && Math.floor(Math.random() * 200) == 0 && idleAnimation == null) {
      let avail = ["sleeping", "scratchSelf"];
      if (nekoPosX < 32) avail.push("scratchWallW");
      if (nekoPosY < 32) avail.push("scratchWallN");
      if (nekoPosX > window.innerWidth - 32) avail.push("scratchWallE");
      if (nekoPosY > window.innerHeight - 32) avail.push("scratchWallS");
      idleAnimation = avail[Math.floor(Math.random() * avail.length)];
    }
    switch (idleAnimation) {
      case "sleeping":
        if (idleAnimationFrame < 8) { setSprite("tired", 0); break; }
        setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
        if (idleAnimationFrame > 192) resetIdleAnimation();
        break;
      case "scratchWallN": case "scratchWallS": case "scratchWallE":
      case "scratchWallW": case "scratchSelf":
        setSprite(idleAnimation, idleAnimationFrame);
        if (idleAnimationFrame > 9) resetIdleAnimation();
        break;
      default:
        setSprite("idle", 0); return;
    }
    idleAnimationFrame += 1;
  }

  function frame() {
    frameCount += 1;
    const diffX = nekoPosX - mousePosX;
    const diffY = nekoPosY - mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < nekoSpeed || distance < 48) { idle(); return; }

    idleAnimation = null; idleAnimationFrame = 0;
    if (idleTime > 1) { setSprite("alert", 0); idleTime = Math.min(idleTime, 7); idleTime -= 1; return; }

    let direction = "";
    direction += diffY / distance > 0.5 ? "N" : "";
    direction += diffY / distance < -0.5 ? "S" : "";
    direction += diffX / distance > 0.5 ? "W" : "";
    direction += diffX / distance < -0.5 ? "E" : "";
    setSprite(direction, frameCount);

    nekoPosX -= (diffX / distance) * nekoSpeed;
    nekoPosY -= (diffY / distance) * nekoSpeed;
    nekoPosX = Math.min(Math.max(16, nekoPosX), window.innerWidth - 16);
    nekoPosY = Math.min(Math.max(16, nekoPosY), window.innerHeight - 16);
    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
