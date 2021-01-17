import { MandelImage } from "wasm-mandel";
import { memory } from "wasm-mandel/wasm_mandel_bg";

const mandel_image = MandelImage.new(1024, 1024);
const width = mandel_image.width();
const height = mandel_image.height();

const canvas = document.getElementById("mandel-canvas");
canvas.height = height;
canvas.width = width;

const ctx = canvas.getContext('2d');

const pixelsPtr = mandel_image.pixels();
var usub = new Uint8ClampedArray(memory.buffer, pixelsPtr, height * height * 4);
var img = new ImageData(usub, width, height);

ctx.putImageData(img, 0, 0);

// We don't need this unless doing animation
// function step() {
    // ctx.putImageData(img, 0, 0)
        // window.requestAnimationFrame(step);
// }
// 
// window.requestAnimationFrame(step);