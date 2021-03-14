const WIDTH = 300;
const HEIGHT = 550;
const WALL_COLOR = '#555555';
const PEG_COLOR = '#666666';

var Example = Example || {};

Example.galtonBoard = function ({
  particleBouncyness = 0.3,
  ballCount = 1500,
  ballSize = 2,
  pegSize = 1,
}) {
  var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Composites = Matter.Composites,
    Common = Matter.Common,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Events = Matter.Events;

  // create engine
  var engine = Engine.create({
      enableSleeping: true,
    }),
    world = engine.world;

  // create renderer
  var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      width: WIDTH,
      height: HEIGHT,
      showAngleIndicator: true,
    },
  });

  Render.run(render);

  // create runner
  var runner = Runner.create();
  Runner.run(runner, engine);

  const ball = (x, y) =>
    Bodies.circle(x, y, ballSize, {
      restitution: particleBouncyness,
      friction: 0.00001,
      frictionAir: 0.042,
      sleepThreshold: 25,
      render: {
        fillStyle: 'yellow',
      },
    });

  const peg = (x, y) =>
    Bodies.circle(x, y, pegSize, {
      isStatic: true,
      render: {
        fillStyle: PEG_COLOR,
      },
    });

  const wall = (x, y, width, height) =>
    Bodies.rectangle(x, y, width, height, {
      isStatic: true,
      render: {
        fillStyle: WALL_COLOR,
      },
    });

  const line = (x, y, width, height, angle) =>
    Bodies.rectangle(x, y, width, height, {
      isStatic: true,
      angle: angle,
      render: {
        fillStyle: WALL_COLOR,
      },
    });

  // outer walls
  World.add(engine.world, [
    wall(150, 0, WIDTH, 20), // top
    wall(150, HEIGHT, WIDTH, 20), // bottom
    wall(0, HEIGHT, 20, HEIGHT * 2), // left
    wall(WIDTH, HEIGHT, 20, HEIGHT * 2), // right
  ]);

  // inner walls
  World.add(engine.world, [
    line(190, 45, 95, 2, Math.PI * -0.3), // right top
    line(110, 45, 95, 2, Math.PI * 0.3), // left top
    line(196, 100, 75, 2, Math.PI * 0.153), // right middle
    line(104, 100, 75, 2, Math.PI * -0.153), // left middle
    line(260, 180, 140, 2, Math.PI * 0.353), // right bottom
    line(40, 180, 140, 2, Math.PI * -0.353), // left bottom
  ]);

  // pegs
  const pegs = [];
  const spacingY = 14;
  const spacingX = 14;
  let i, j;
  for (i = 0; i < 21; i++) {
    for (j = 1; j < i; j++) {
      if (i > 9) {
        pegs.push(
          World.add(
            engine.world,
            peg(150 + (j * spacingX - i * (spacingX / 2)), i * spacingY - 10)
          )
        );
      }
    }
  }

  // divider walls
  for (let x = 20; x <= 280; x += 10) {
    if (x !== 0) {
      let divider = wall(x, 415, 2, 260);
      World.add(engine.world, divider);
    }
  }

  const rand = (min, max) => Math.random() * (max - min) + min;

  const dropBall = () => {
    let droppedBall = ball(150 + rand(-1, 1), 15);

    Body.setVelocity(droppedBall, {
      x: rand(-0.05, 0.05),
      y: 0,
    });
    Body.setAngularVelocity(droppedBall, rand(-0.05, 0.05));

    Events.on(droppedBall, 'sleepStart', () => {
      Body.setStatic(droppedBall, true);
    });

    World.add(engine.world, droppedBall);
  };

  let count = 0;
  const intervalId = setInterval(function () {
    if (count === ballCount) {
      clearInterval(intervalId);
    }

    dropBall();
    count++;
  }, 10);

  // add mouse control
  var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });

  World.add(world, mouseConstraint);

  // keep the mouse in sync with rendering
  render.mouse = mouse;

  // fit the render viewport to the scene
  Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: WIDTH, y: HEIGHT },
  });

  // context for MatterTools.Demo
  return {
    engine: engine,
    runner: runner,
    render: render,
    canvas: render.canvas,
    stop: function () {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
    },
  };
};
