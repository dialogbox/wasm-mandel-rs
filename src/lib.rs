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

    upper_left: (f64, f64),
    lower_right: (f64, f64),
    limit: u32,

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
            upper_left: (-2.0, 1.5),
            lower_right: (1.0, -1.5),
            limit: 2,
            pixels: vec![[0, 0, 0, 255]; width * height],
        }
    }

    // fn get_index(&self, x: usize, y: usize) -> usize {
    //     (y * self.width + x) as usize
    // }

    fn index_to_point(&self, i: usize) -> (f64, f64) {
        let y = i / self.width;
        let x = i % self.width;

        self.pixel_to_point((x, y))
    }

    pub fn draw_mandel(&mut self, limit: u32) {
        self.limit = limit;
        for i in 0..self.pixels.len() {
            let result = self.is_in_mandel(self.index_to_point(i));
            Self::get_color(result, self.limit, &mut self.pixels[i]);
        }
    }

    /// Given the row and column of a pixel in the output image, return the
    /// corresponding point on the complex plane.
    ///
    /// `bounds` is a pair giving the width and height of the image in pixels.
    /// `pixel` is a (column, row) pair indicating a particular pixel in that image.
    /// The `upper_left` and `lower_right` parameters are points on the complex
    /// plane designating the area our image covers.
    fn pixel_to_point(&self, pixel: (usize, usize)) -> (f64, f64) {
        let (width, height) = (
            self.lower_right.0 - self.upper_left.0,
            self.upper_left.1 - self.lower_right.1,
        );
        (
            self.upper_left.0 + pixel.0 as f64 * width / self.width as f64,
            self.upper_left.1 - pixel.1 as f64 * height / self.height as f64,
            // Why subtraction here? pixel.1 increases as we go down,
            // but the imaginary component increases as we go up.
        )
    }

    /// Try to determine if `c` is in the Mandelbrot set, using at most `limit`
    /// iterations to decide.
    ///
    /// If `c` is not a member, return `Some(i)`, where `i` is the number of
    /// iterations it took for `c` to leave the circle of radius two centered on the
    /// origin. If `c` seems to be a member (more precisely, if we reached the
    /// iteration limit without being able to prove that `c` is not a member),
    /// return `None`.
    fn is_in_mandel(&self, c: (f64, f64)) -> Option<u32> {
        let mut z = (0.0, 0.0);
        for i in 0..self.limit {
            z = (
                (z.0 * z.0) - (z.1 * z.1) + c.0,
                (z.0 * z.1) + (z.1 * z.0) + c.1,
            );
            let norm_sqr = (z.0 * z.0) + (z.1 * z.1);
            if norm_sqr > 4.0 {
                return Some(i);
            }
        }

        None
    }

    fn get_color(num: Option<u32>, limit: u32, buf: &mut [u8; 4]) {
        buf[3] = 255;
        match num {
            None => {
                buf[0] = 0;
                buf[1] = 0;
                buf[2] = 0
            }
            Some(i) => {
                let i = (i as f64 / (limit as f64 / 255.0)) as u8;
                buf[0] = i;
                buf[1] = i;
                buf[2] = i;
            }
        }
    }
}

impl Default for MandelImage {
    fn default() -> Self {
        let width = 1024;
        let height = 1024;
        MandelImage {
            width,
            height,
            upper_left: (-2.0, 2.0),
            lower_right: (2.0, -2.0),
            limit: 255,
            pixels: vec![[0, 0, 0, 255]; width * height],
        }
    }
}
