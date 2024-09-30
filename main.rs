use std::time::{Duration, Instant};
use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement};

#[wasm_bindgen]
pub struct GameState {
    player_y: f64,
    computer_y: f64,
    ball_x: f64,
    ball_y: f64,
    ball_speed_x: f64,
    ball_speed_y: f64,
    player_score: u32,
    computer_score: u32,
}

#[wasm_bindgen]
impl GameState {
    pub fn new() -> GameState {
        GameState {
            player_y: 160.0,
            computer_y: 160.0,
            ball_x: 400.0,
            ball_y: 200.0,
            ball_speed_x: 5.0,
            ball_speed_y: 5.0,
            player_score: 0,
            computer_score: 0,
        }
    }

    pub fn update(&mut self) {
    }
}

#[wasm_bindgen]
pub fn game_loop(ctx: &CanvasRenderingContext2d, state: &mut GameState) {
    let start = Instant::now();

    state.update();
    draw(ctx, state);

    let duration = start.elapsed();
    if duration < Duration::from_millis(16) {
        std::thread::sleep(Duration::from_millis(16) - duration);
    }
}

fn draw(ctx: &CanvasRenderingContext2d, state: &GameState) {
}

#[wasm_bindgen(start)]
pub fn main() -> Result<(), JsValue> {
    let window = web_sys::window().unwrap();
    let document = window.document().unwrap();
    let canvas = document.get_element_by_id("gameCanvas").unwrap();
    let canvas: HtmlCanvasElement = canvas.dyn_into::<HtmlCanvasElement>()?;
    let ctx = canvas.get_context("2d")?.unwrap().dyn_into::<CanvasRenderingContext2d>()?;

    let mut state = GameState::new();

    let f = Closure::wrap(Box::new(move || {
        game_loop(&ctx, &mut state);
        window.request_animation_frame(f.as_ref().unchecked_ref()).unwrap();
    }) as Box<dyn FnMut()>);

    window.request_animation_frame(f.as_ref().unchecked_ref())?;
    f.forget();

    Ok(())
}
