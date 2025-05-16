
# AnimaLLT Overlay

**AnimaLLT Overlay** is a custom Overwolf WebApp that listens for a specific Twitch Channel Point redemption and displays a fun, full-screen animation — no OBS or browser source required.

Built by LuckyLootTube with the help of ChatGPT

---

## Features

* **Twitch Integration**: Listens via Streamer.bot’s WebSocket plugin for a Channel Point reward titled `AnimaLLT`.
* **Full-Screen Animation**: Shows a random cute animal graphic.
* **Universal Overlay**: Runs as a GPU-accelerated, transparent, click-through overlay above any windowed or borderless game (including Path of Exile 2), auto-sizing to your monitor.
* **Discord Rich Presence**: Updates your Discord status to `Playing "AnimaLLT Channel Reward"` and thanks the redeemer by name.

---

## Getting Started

### 1. Clone this repository

```bash
git clone https://github.com/YourUser/AnimaLLT-Overlay.git
cd AnimaLLT-Overlay
```

### 2. Configure Streamer.bot

1. Open **Streamer.bot**.
2. Enable **Auto-Start WebSocket Server** in Settings → WebSockets.
3. Set:

   * **Address**: `127.0.0.1`
   * **Port**: `8181`
   * **Endpoint**: `/`
4. Click **Start Server**.

> **Tip:** To use different settings, open `overlay.html`, search for `new StreamerbotClient({…})`, and update `host`, `port`, or `endpoint` accordingly.

### 3. Install & Load in Overwolf

1. Launch **Overwolf**.
2. Go to **Settings ⚙️ → About → Development Options** and enable **Developer Mode**.
3. Click **Load Unpacked App** and select this project folder.
4. In the **Dev Apps** list, click **Launch** next to **AnimaLLT Overlay**.

---

## Configuration

* **Reward Title**: Open `overlay.html` and find the `CONFIG` block:

  ```js
  const CONFIG = {
    rewardTitle: 'AnimaLLT',  // ← Change this to match your Twitch reward name
    // ...
  };
  ```
* **Assets**: Place your `.webp` animal images into `assets/animals/`.
* **Window Settings**: Customize sizing, icons and permissions in `manifest.json`.
* **Resize Logic**: Tweak when and how the overlay auto-resizes in `background.js`.

---

## Discord Rich Presence Plugin

To show a custom status on Discord when a reward is claimed:

1. Make sure you run DiscordRPCPlugin.exe as a local server

The plugin will update your status to:

```
Playing "AnimaLLT Channel Reward"
Thanks <Username> for redeeming!
```

> **Customize** the status text in `plugin.js` inside the plugin folder.

---

## Development

* **Files to edit**:

  * `manifest.json` — app metadata, window config, permissions.
  * `overlay.html` — main overlay markup/script.
  * `background.js`  — window restore/resize logic.

* **Build**: No build step—pure HTML/JS/CSS.

* **Run**: Unpacked in Overwolf *only* (developer app).

---

## License

From LuckyLootTube with love. <3
