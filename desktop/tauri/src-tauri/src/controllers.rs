//! Native fallback for WebViews with no usable Gamepad API. No keyboard
//! injection, network, filesystem writes, or controller permissions escalation.
use serde::Serialize;
use std::sync::{atomic::{AtomicBool, Ordering}, Arc, Mutex};

#[derive(Clone, Serialize)]
pub struct Pad {
    index: usize,
    id: String,
    connected: bool,
    mapping: &'static str,
    axes: [f32; 4],
    buttons: [f32; 17],
}

#[derive(Clone, Default, Serialize)]
pub struct Snapshot {
    ready: bool,
    pads: Vec<Pad>,
    error: Option<String>,
}

pub struct ControllerService {
    snapshot: Arc<Mutex<Snapshot>>,
    stop: Arc<AtomicBool>,
}

impl ControllerService {
    pub fn start() -> Self {
        let snapshot = Arc::new(Mutex::new(Snapshot::default()));
        let stop = Arc::new(AtomicBool::new(false));
        #[cfg(any(target_os = "windows", target_os = "linux"))]
        {
            let shared = Arc::clone(&snapshot);
            let should_stop = Arc::clone(&stop);
            let thread = std::thread::Builder::new()
                .name("gumflow-gamepads".into())
                .spawn(move || native_poll(shared, should_stop));
            if let Err(error) = thread {
                if let Ok(mut value) = snapshot.lock() {
                    value.error = Some(format!("Could not start controller thread: {error}"));
                }
            }
        }
        #[cfg(not(any(target_os = "windows", target_os = "linux")))]
        if let Ok(mut value) = snapshot.lock() {
            value.error = Some("Native controller bridge is enabled only on Windows/Linux".into());
        }
        Self { snapshot, stop }
    }
}

impl Drop for ControllerService {
    fn drop(&mut self) { self.stop.store(true, Ordering::Relaxed); }
}

#[tauri::command]
pub fn controller_snapshot(service: tauri::State<'_, ControllerService>) -> Result<Snapshot, String> {
    service.snapshot.lock().map(|s| s.clone())
        .map_err(|_| "Controller state is unavailable".to_string())
}

#[cfg(any(target_os = "windows", target_os = "linux"))]
fn native_poll(shared: Arc<Mutex<Snapshot>>, stop: Arc<AtomicBool>) {
    use gilrs::{Axis, Button, Gilrs};
    // Construct and use gilrs on the same thread. It is never moved into Tauri's
    // shared state. Default gilrs uses Windows Gaming Input / Linux evdev.
    let mut gilrs = match Gilrs::new() {
        Ok(g) => g,
        Err(e) => {
            if let Ok(mut value) = shared.lock() { value.error = Some(e.to_string()); }
            return;
        }
    };
    let order = [Button::South, Button::East, Button::West, Button::North,
        Button::LeftTrigger, Button::RightTrigger, Button::LeftTrigger2, Button::RightTrigger2,
        Button::Select, Button::Start, Button::LeftThumb, Button::RightThumb,
        Button::DPadUp, Button::DPadDown, Button::DPadLeft, Button::DPadRight, Button::Mode];
    while !stop.load(Ordering::Relaxed) {
        while gilrs.next_event().is_some() {} // auto_update is enabled by default.
        let pads = gilrs.gamepads().take(8).map(|(id, g)| {
            let mut buttons = [0.0;17];
            for (i,b) in order.iter().enumerate() {
                buttons[i] = g.button_data(*b).map(|data| data.value()).unwrap_or(0.0);
                if g.is_pressed(*b) { buttons[i] = buttons[i].max(1.0); }
            }
            // gilrs uses positive Y upwards; browser standard mapping uses down.
            Pad { index: usize::from(id), id: g.name().chars().take(160).collect(),
                connected: true, mapping: "standard",
                axes: [g.value(Axis::LeftStickX), -g.value(Axis::LeftStickY),
                    g.value(Axis::RightStickX), -g.value(Axis::RightStickY)], buttons }
        }).collect();
        if let Ok(mut value) = shared.lock() { *value = Snapshot { ready:true, pads, error:None }; }
        gilrs.inc();
        std::thread::sleep(std::time::Duration::from_millis(8));
    }
}
