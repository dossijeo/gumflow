mod controllers;
use tauri::Manager;

fn allowed_navigation(url: &tauri::Url) -> bool {
    // No remote sites get access to the Tauri bridge. No localhost server in
    // release builds: Tauri serves the embedded files via its own protocol.
    let bundled = (url.scheme() == "tauri" && url.host_str() == Some("localhost"))
        || (url.scheme() == "https" && url.host_str() == Some("tauri.localhost"));
    let development = cfg!(debug_assertions)
        && url.scheme() == "http"
        && url.host_str() == Some("127.0.0.1")
        && url.port() == Some(5173);
    bundled || development
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![controllers::controller_snapshot])
        .setup(|app| {
            app.manage(controllers::ControllerService::start());
            tauri::WebviewWindowBuilder::from_config(app.handle(), &app.config().app.windows[0])?
                .on_navigation(allowed_navigation)
                .build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("GUMFLOW desktop runtime could not start");
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn navigation_does_not_expose_the_bridge_to_remote_pages() {
        for value in ["https://example.com", "https://tauri.localhost.evil.test/", "file:///etc/passwd"] {
            assert!(!allowed_navigation(&tauri::Url::parse(value).unwrap()));
        }
        assert!(allowed_navigation(&tauri::Url::parse("tauri://localhost/index.html").unwrap()));
        assert!(allowed_navigation(&tauri::Url::parse("https://tauri.localhost/index.html").unwrap()));
    }
}
