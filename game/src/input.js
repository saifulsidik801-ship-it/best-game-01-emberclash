// EMBERCLASH — input: keyboard + mouse + touch, one shared state.
// One job: poll keys, track clicks/taps, expose "pressed this frame" edges.
import { KEYS } from './config.js';

export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.pressed = new Set(); // edges, cleared each frame by endFrame()
    this.mouse = { x: 0, y: 0, clicked: false, down: false };
    this.touch = { active: false, x: 0, y: 0 };
    this.anyKey = false;
    window.addEventListener('keydown', (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault();
      if (!this.keys.has(e.code)) this.pressed.add(e.code);
      this.keys.add(e.code); this.anyKey = true;
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());
    canvas.addEventListener('mousemove', (e) => { const r = canvas.getBoundingClientRect(); this.mouse.x = (e.clientX - r.left) * canvas.width / r.width; this.mouse.y = (e.clientY - r.top) * canvas.height / r.height; });
    canvas.addEventListener('mousedown', (e) => { this.mouse.down = true; this.mouse.clicked = true; const r = canvas.getBoundingClientRect(); this.mouse.x = (e.clientX - r.left) * canvas.width / r.width; this.mouse.y = (e.clientY - r.top) * canvas.height / r.height; });
    window.addEventListener('mouseup', () => { this.mouse.down = false; });
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); const t = e.touches[0]; const r = canvas.getBoundingClientRect(); this.touch.active = true; this.touch.x = (t.clientX - r.left) * canvas.width / r.width; this.touch.y = (t.clientY - r.top) * canvas.height / r.height; this.mouse.x = this.touch.x; this.mouse.y = this.touch.y; this.mouse.clicked = true; }, { passive: false });
    canvas.addEventListener('touchend', () => { this.touch.active = false; });
  }
  down(group) { return KEYS[group].some((c) => this.keys.has(c)); }
  hit(group) { return KEYS[group].some((c) => this.pressed.has(c)); }
  /** True when mouse clicked or screen tapped inside rect {x,y,w,h} this frame. */
  clickedIn(r) { return this.mouse.clicked && this.mouse.x >= r.x && this.mouse.x <= r.x + r.w && this.mouse.y >= r.y && this.mouse.y <= r.y + r.h; }
  hoverIn(r) { return this.mouse.x >= r.x && this.mouse.x <= r.x + r.w && this.mouse.y >= r.y && this.mouse.y <= r.y + r.h; }
  endFrame() { this.pressed.clear(); this.mouse.clicked = false; this.anyKey = false; }
  /** Virtual d-pad state for touch: returns -1/0/1 horizontal from touch position. */
  touchDir() { if (!this.touch.active) return 0; return this.touch.x < 420 ? -1 : this.touch.x > 860 ? 1 : 0; }
}
