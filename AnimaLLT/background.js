// background.js
console.log("🔄 background.js loaded");

// Helper: restore, move, resize, bring to front
function ensureWindowTop(name, primary) {
  overwolf.windows.obtainDeclaredWindow(name, (odw) => {
    if (odw.status !== 'success') {
      return console.error(`❌ obtainDeclaredWindow(${name})`, odw);
    }
    const id = odw.window.id;

    overwolf.windows.restore(id, (res) => {
      if (res.status !== 'success') {
        return console.error(`❌ restore(${name})`, res);
      }

      // Move
      overwolf.windows.changePosition(id, 0, 0, (posRes) => {
        if (posRes.status !== 'success') {
          console.error(`❌ changePosition(${name})`, posRes);
        }
      });

      // Resize and bring to front
      overwolf.windows.changeSize(id, primary.width, primary.height, (sizeRes) => {
        if (sizeRes.status !== 'success') {
          console.error(`❌ changeSize(${name})`, sizeRes);
        }
        overwolf.windows.bringToFront(id, (bfRes) => {
          if (bfRes.status !== 'success') {
            console.error(`❌ bringToFront(${name})`, bfRes);
          } else {
            console.log(`✅ ${name} is on top`);
          }
        });
      });
    });
  });
}

// 1) App launch: restore overlay windows & start RPC server
overwolf.extensions.onAppLaunchTriggered.addListener(() => {
  console.log("🚀 onAppLaunchTriggered fired");

  // Launch Discord RPC server
  overwolf.extensions.launchExternalFile(
    { id: "discordRpcServer" },
    (launchRes) => {
      if (!launchRes.success) {
        console.error("❌ Discord RPC launch failed:", launchRes);
      } else {
        console.log("✅ Discord RPC started:", launchRes);
      }
    }
  );

  // Restore overlays
  overwolf.utils.getMonitorsList((monRes) => {
    if (monRes.status !== 'success') {
      return console.error("❌ getMonitorsList failed:", monRes);
    }
    const primary = monRes.monitors.find(m => m.primary);
    if (!primary) {
      return console.error("❌ No primary monitor found.", monRes.monitors);
    }

    ['overlayDesktop', 'overlayGame'].forEach(name => ensureWindowTop(name, primary));
  });
});

// 2) RPC messages from overlay
overwolf.extensions.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "launchRpc") {
    console.log("📨 Received launchRpc message");
    overwolf.extensions.launchExternalFile(
      { id: "discordRpcServer" },
      (res) => {
        console.log("🛠 launchExternalFile result:", res);
        sendResponse(res);
      }
    );
    return true; // keep channel open for async sendResponse
  }
});

// 3) Re-restore when game starts or gains focus
overwolf.games.onGameInfoUpdated.addListener((gameInfo) => {
  if (gameInfo.status === 'success' && gameInfo.gameInfo.isRunning) {
    console.log("🎮 onGameInfoUpdated – game running");
    overwolf.utils.getMonitorsList(monRes => {
      if (monRes.status === 'success') {
        const primary = monRes.monitors.find(m => m.primary);
        ['overlayDesktop', 'overlayGame'].forEach(name => ensureWindowTop(name, primary));
      }
    });
  }
});

// 4) Re-raise overlay whenever another window gains focus
overwolf.windows.onForegroundChanged.addListener((change) => {
  overwolf.utils.getMonitorsList((monRes) => {
    if (monRes.status !== 'success') {
      return console.error('❌ getMonitorsList failed in onForegroundChanged:', monRes);
    }
    const primary = monRes.monitors.find(m => m.primary);
    if (!primary) {
      return console.error('❌ No primary monitor found in onForegroundChanged.');
    }
    ['overlayDesktop', 'overlayGame'].forEach(name => ensureWindowTop(name, primary));
  });
});
