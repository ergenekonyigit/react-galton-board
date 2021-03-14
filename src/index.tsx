import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { sample } from 'lodash-es';

const WIDTH = 300;
const HEIGHT = 550;
const BACKGROUND_COLOR = '#000000';
const WALL_COLOR = '#333333';
const PEG_COLOR = '#444444';

const colors = [
  '#ff2d55',
  '#5856d6',
  '#ff9500',
  '#ffcc00',
  '#ff3b30',
  '#5ac8fa',
  '#007aff',
  '#4cd964',
];

const color = sample(colors);

export type GaltonBoardType = ({
  particleBouncyness,
  ballCount,
  ballSize,
  pegSize,
}: {
  particleBouncyness: number;
  ballCount: number;
  ballSize: number;
  pegSize: number;
}) => JSX.Element

const GaltonBoard: GaltonBoardType = ({
  particleBouncyness = 0.3,
  ballCount = 1500,
  ballSize = 2,
  pegSize = 1,
}) => {
  const boxRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let Engine = Matter.Engine;
    let Render = Matter.Render;
    let Runner = Matter.Runner;
    let World = Matter.World;
    let Bodies = Matter.Bodies;
    let Body = Matter.Body;
    let Events = Matter.Events;

    let engine = Engine.create({
      enableSleeping: true,
    });

    let render = Render.create({
      element: boxRef.current as any,
      engine: engine,
      canvas: canvasRef.current as any,
      options: {
        width: WIDTH,
        height: HEIGHT,
        background: BACKGROUND_COLOR,
        wireframes: false,
        showSleeping: false,
      },
    });

    Render.run(render);

    const runner = Runner.create();
    Runner.run(runner, engine);

    const ball = (x: number, y: number) =>
      Bodies.circle(x, y, ballSize, {
        restitution: particleBouncyness,
        friction: 0.00001,
        frictionAir: 0.042,
        sleepThreshold: 25,
        render: {
          fillStyle: color,
        },
      });

    const peg = (x: number, y: number) =>
      Bodies.circle(x, y, pegSize, {
        isStatic: true,
        render: {
          fillStyle: PEG_COLOR,
        },
      });

    const wall = (x: number, y: number, width: number, height: number) =>
      Bodies.rectangle(x, y, width, height, {
        isStatic: true,
        render: {
          fillStyle: WALL_COLOR,
        },
      });

    const line = (
      x: number,
      y: number,
      width: number,
      height: number,
      angle: number
    ) =>
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

    const rand = (min: number, max: number) =>
      Math.random() * (max - min) + min;

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

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      ref={boxRef}
      style={{
        width: WIDTH,
        height: HEIGHT,
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default GaltonBoard;
