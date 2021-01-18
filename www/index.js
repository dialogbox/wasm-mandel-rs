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

// Rendering loop
const MAX_LIMIT = 10;
const fps = 5;
var limit = 1;
function step() {
    setTimeout(function () {
        mandel_image.draw_mandel(limit);
        ctx.putImageData(img, 0, 0)
        if (limit <= MAX_LIMIT) {
            limit = limit + 1;
            window.requestAnimationFrame(step);
        }
    }, 1000 / fps);
}

window.requestAnimationFrame(step);

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