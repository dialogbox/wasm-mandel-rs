import { MandelImage } from "wasm-mandel";
import { memory } from "wasm-mandel/wasm_mandel_bg";

const height = 1280;
const width = 1280;
const canvas = document.getElementById("mandel-canvas");

const ctx = setup_canvas(canvas, width, height);

// Create wasm object and map memory
const mandel_image = MandelImage.new(canvas.width, canvas.height);
const pixelsPtr = mandel_image.pixels();
var usub = new Uint8ClampedArray(memory.buffer, pixelsPtr, canvas.width * canvas.height * 4);
var img = new ImageData(usub, canvas.width, canvas.height);

const fps = create_fps_panel();
draw_mandel(0);

let animationId = null;

const steps_input = document.getElementById("steps-input");
const fps_input = document.getElementById("fps-input");

const MAX_LIMIT = 100;
var limit = 0;
var run = false;

const playPauseButton = document.getElementById("play-pause");
const resetButton = document.getElementById("reset");

playPauseButton.addEventListener("click", event => {
    if (!run) {
        play();
    } else {
        pause();
    }
});

resetButton.addEventListener("click", event => {
    limit = 0;
    draw_mandel(0);
});

function draw_mandel(limit) {
    fps.render();

    mandel_image.set_limit(limit);
    mandel_image.draw_mandel();
    ctx.putImageData(img, 0, 0);
}

// Rendering loop
function renderLoop() {
    if (!run) return;

    const max_fps = parseInt(fps_input.value);
    const limit_steps = parseInt(steps_input.value);

    console.log(limit, limit_steps, limit+limit_steps, max_fps);
    setTimeout(function () {
        draw_mandel(limit);
        limit = Math.min(limit + limit_steps, MAX_LIMIT);
        if (limit < MAX_LIMIT) {
            animationId = requestAnimationFrame(renderLoop);
        }
    }, 1000 / max_fps);
}

function play() {
    console.log("Play");
    run = true;
    // playPauseButton.textContent = "Stop";
    playPauseButton.setAttribute("value", "Stop");
    renderLoop();
}

function pause() {
    console.log("Pause");
    run = false;
    // playPauseButton.textContent = "Start";
    playPauseButton.setAttribute("value", "Start");
    cancelAnimationFrame(animationId);
    animationId = null;
}

function setup_canvas(canvas, width, height, dpr = (window.devicePixelRatio || 1)) {
    const ctx = canvas.getContext('2d');

    const image_width = width * dpr;
    const image_height = height * dpr;

    canvas.height = image_height;
    canvas.width = image_width;
    ctx.scale(dpr, dpr);

    // scale everything down using CSS
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    return ctx;
}

function create_fps_panel() {
return new class {
    constructor() {
        this.fps = document.getElementById("fps");
        this.frames = [];
        this.lastFrameTimeStamp = performance.now();
    }

    render() {
        // Convert the delta time since the last frame render into a measure
        // of frames per second.
        const now = performance.now();
        const delta = now - this.lastFrameTimeStamp;
        this.lastFrameTimeStamp = now;
        const fps = 1 / delta * 1000;

        // Save only the latest 100 timings.
        this.frames.push(fps);
        if (this.frames.length > 100) {
            this.frames.shift();
        }

        // Find the max, min, and mean of our 100 latest timings.
        let min = Infinity;
        let max = -Infinity;
        let sum = 0;
        for (let i = 0; i < this.frames.length; i++) {
            sum += this.frames[i];
            min = Math.min(this.frames[i], min);
            max = Math.max(this.frames[i], max);
        }
        let mean = sum / this.frames.length;

        // Render the statistics.
        this.fps.textContent = `
  Frames per Second:
           latest = ${Math.round(fps)}
  avg of last 100 = ${Math.round(mean)}
  min of last 100 = ${Math.round(min)}
  max of last 100 = ${Math.round(max)}
  `.trim();
    }
};

}