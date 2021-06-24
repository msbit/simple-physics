globalThis.addEventListener('load', () => {
  const canvas = document.getElementById('canvas');
  canvas.width = 800;
  canvas.height = 800;
  const context = canvas.getContext('2d');

  const state = {
    position: {
      x: canvas.width / 2,
      y: canvas.height / 2
    },
    maxVelocity: 100,
    velocity: {
      x: 0,
      y: 0
    },
    damping: 0.1,
    accelerationForce: 30,
    acceleration: {
      x: 0,
      y: 0
    },
    input: {
      up: false,
      down: false,
      left: false,
      right: false
    },
    context,
    entityWidth: 30,
    entityHeight: 30
  };

  mapkeys({
    ArrowUp: v => state.input.down = v,
    ArrowDown: v => state.input.up = v,
    ArrowLeft: v => state.input.left = v,
    ArrowRight: v => state.input.right = v
  });

  let previous = performance.now();
  const tick = (current) => {
    const elapsed = current - previous;

    update(state, elapsed);

    draw(state, elapsed);

    previous = current;
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
});

const update = (state, elapsed) => {
  // 1) zero `acceleration`
  state.acceleration.x = 0;
  state.acceleration.y = 0;

  // 2) check inputs and update `acceleration`
  const force = (elapsed * state.accelerationForce) / 1000;
  if (state.input.up) {
    state.acceleration.y += force;
  }
  if (state.input.down) {
    state.acceleration.y -= force;
  }
  if (state.input.left) {
    state.acceleration.x -= force;
  }
  if (state.input.right) {
    state.acceleration.x += force;
  }

  // 3) apply `acceleration` to `velocity`
  state.velocity.x += state.acceleration.x;
  state.velocity.y += state.acceleration.y;

  // 4) apply `damping` to `velocity`
  const damping = {
    x: -state.velocity.x,
    y: -state.velocity.y
  };
  damping.x *= state.damping;
  damping.y *= state.damping;

  state.velocity.x += damping.x;
  state.velocity.y += damping.y;

  // 5) clamp `velocity` between valid values
  state.velocity.x = clamp(-state.maxVelocity, state.maxVelocity, state.velocity.x);
  state.velocity.y = clamp(-state.maxVelocity, state.maxVelocity, state.velocity.y);

  // 6) apply `velocity` to `position`
  state.position.x += state.velocity.x;
  state.position.y += state.velocity.y;

  state.position.x = clamp(state.entityWidth / 2, state.context.canvas.width - (state.entityWidth / 2), state.position.x);
  state.position.y = clamp(state.entityHeight / 2, state.context.canvas.height - (state.entityHeight / 2), state.position.y);
};

const draw = (state, elapsed) => {
  // 1) draw the background
  state.context.fillStyle = 'whitesmoke';
  state.context.fillRect(0, 0, state.context.canvas.width, state.context.canvas.height);

  // 2) draw the controllable block
  state.context.fillStyle = 'orangered';
  state.context.fillRect(state.position.x - (state.entityWidth / 2), state.position.y - (state.entityHeight / 2), state.entityWidth, state.entityHeight);

  // 3) draw the FPS
  state.context.fillStyle = 'slategrey';
  state.context.font = '20px sans-serif';
  state.context.fillText((1000 / elapsed).toFixed(2), 0, 20);
};

const clamp = (min, max, value) => Math.max(min, Math.min(max, value));

const mapkeys = (mappings, target = globalThis) => {
  target.addEventListener('keydown', (event) => {
    if (mappings[event.key] === undefined) { return; }

    mappings[event.key](true);
  });
  target.addEventListener('keyup', (event) => {
    if (mappings[event.key] === undefined) { return; }

    mappings[event.key](false);
  });
};
