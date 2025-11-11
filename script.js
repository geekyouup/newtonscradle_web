document.addEventListener('DOMContentLoaded', () => {
    const { Engine, Render, Runner, World, Bodies, Body, Constraint, Composite, Composites, Mouse, MouseConstraint } = Matter;

    const canvasContainer = document.getElementById('canvas-container');
    const ballCountInput = document.getElementById('ball-count');
    const ballCountValue = document.getElementById('ball-count-value');
    const spacingInput = document.getElementById('spacing');
    const spacingValue = document.getElementById('spacing-value');
    const stringLengthInput = document.getElementById('string-length');
    const stringLengthValue = document.getElementById('string-length-value');

    const width = 800;
    const height = 600;

    let engine, render, runner, world, mouseConstraint;

    let cradle;

    function init() {
        // create engine
        engine = Engine.create();
        world = engine.world;

        // create renderer
        render = Render.create({
            element: canvasContainer,
            engine: engine,
            options: {
                width: width,
                height: height,
                wireframes: false,
                background: '#1a1a1a'
            }
        });

        Render.run(render);

        // create runner
        runner = Runner.create();
        Runner.run(runner, engine);

        // add mouse control
        const mouse = Mouse.create(render.canvas);
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

        World.add(world, mouseConstraint);

        // keep the mouse in sync with rendering
        render.mouse = mouse;

        createCradle(ballCountInput.value, spacingInput.value, stringLengthInput.value);
    }

    function createCradle(number, spacing, length) {
        if (cradle) {
            Composite.remove(world, cradle);
        }

        cradle = Composite.create({ label: 'Cradle' });

        const ballSize = 40;
        const ropeLength = parseInt(length);
        const spacingInt = parseInt(spacing);
        const numberInt = parseInt(number);

        // Calculate dimensions
        // Width of the array of balls
        const totalBallWidth = numberInt * ballSize + (numberInt - 1) * spacingInt;

        // Frame dimensions
        const frameWidth = Math.max(totalBallWidth + 100, 300); // Minimum width
        const frameHeight = ropeLength + ballSize * 3;
        const frameThickness = 15;
        const frameColor = '#5d4037'; // Wood-like color, or use '#333' for metal

        const startX = width / 2 - ((numberInt - 1) * (ballSize + spacingInt)) / 2;
        const startY = height / 2 - ropeLength / 2;

        // --- Create Frame ---

        // Top Bar
        const topBar = Bodies.rectangle(width / 2, startY - frameThickness / 2, frameWidth, frameThickness, {
            isStatic: true,
            render: { fillStyle: '#8d6e63' }, // Lighter wood
            collisionFilter: { category: 0x0002, mask: 0 }
        });

        // Legs
        const legHeight = frameHeight;
        const legY = startY + legHeight / 2 - frameThickness / 2;

        const leftLeg = Bodies.rectangle(width / 2 - frameWidth / 2 + frameThickness / 2, legY, frameThickness, legHeight, {
            isStatic: true,
            render: { fillStyle: '#5d4037' },
            collisionFilter: { category: 0x0002, mask: 0 }
        });

        const rightLeg = Bodies.rectangle(width / 2 + frameWidth / 2 - frameThickness / 2, legY, frameThickness, legHeight, {
            isStatic: true,
            render: { fillStyle: '#5d4037' },
            collisionFilter: { category: 0x0002, mask: 0 }
        });

        // Base
        const baseWidth = frameWidth + 40;
        const baseHeight = frameThickness;
        const baseY = startY + legHeight - frameThickness / 2;

        const base = Bodies.rectangle(width / 2, baseY, baseWidth, baseHeight, {
            isStatic: true,
            render: { fillStyle: '#5d4037' },
            collisionFilter: { category: 0x0002, mask: 0 }
        });

        Composite.add(cradle, [topBar, leftLeg, rightLeg, base]);

        // --- Create Balls ---

        for (let i = 0; i < numberInt; i++) {
            const ballX = startX + i * (ballSize + spacingInt);
            const ball = Bodies.circle(ballX, startY + ropeLength, ballSize / 2, {
                restitution: 1,
                friction: 0,
                frictionAir: 0,
                slop: 1,
                inertia: Infinity,
                label: 'Ball',
                render: {
                    fillStyle: 'linear-gradient(145deg, #cacaca, #f0f0f0)', // Attempt at gradient, but Matter.js render is simple. 
                    // Actually Matter.js Render doesn't support gradients easily without custom rendering.
                    // Let's stick to a nice metallic color.
                    fillStyle: '#b0b0b0',
                    strokeStyle: '#999',
                    lineWidth: 1
                }
            });

            const rope = Constraint.create({
                pointA: { x: ballX, y: startY },
                bodyB: ball,
                render: {
                    strokeStyle: '#e0e0e0', // String color
                    lineWidth: 1.5,
                    anchors: false
                }
            });

            Composite.addBody(cradle, ball);
            Composite.addConstraint(cradle, rope);
        }

        World.add(world, cradle);

        // Swing the first ball
        const balls = cradle.bodies.filter(b => b.label === 'Ball');
        if (balls.length > 0) {
            Body.translate(balls[0], { x: -((ballSize + spacingInt) * 2), y: -ballSize });
        }
    }

    ballCountInput.addEventListener('input', (e) => {
        ballCountValue.textContent = e.target.value;
        createCradle(e.target.value, spacingInput.value, stringLengthInput.value);
    });

    spacingInput.addEventListener('input', (e) => {
        spacingValue.textContent = e.target.value;
        createCradle(ballCountInput.value, e.target.value, stringLengthInput.value);
    });

    stringLengthInput.addEventListener('input', (e) => {
        stringLengthValue.textContent = e.target.value;
        createCradle(ballCountInput.value, spacingInput.value, e.target.value);
    });

    init();
});
