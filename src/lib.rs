mod utils;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct MandelImage {
    width: usize,
    height: usize,

    pixels: Vec<[u8; 4]>,
}

#[wasm_bindgen]
impl MandelImage {
    pub fn width(&self) -> usize {
        self.width
    }

    pub fn height(&self) -> usize {
        self.height
    }

    pub fn pixels(&self) -> *const [u8; 4] {
        self.pixels.as_ptr()
    }

    pub fn new(width: usize, height: usize) -> Self {
        MandelImage {
            width,
            height,
            pixels: vec![[0, 0, 0, 255]; width * height],
        }
    }

    fn get_index(&self, x: usize, y: usize) -> usize {
        (y * self.width + x) as usize
    }

    fn draw_mandel(&self) {}
}

impl Default for MandelImage {
    fn default() -> Self {
        let width = 1024;
        let height = 1024;
        MandelImage {
            width,
            height,
            pixels: vec![[0, 0, 0, 0]; width * height],
        }
    }
}
