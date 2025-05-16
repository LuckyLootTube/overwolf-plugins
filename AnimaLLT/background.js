// background.js
console.log("🔄 background.js loaded");

// 1) Launch on app start (Dev Board “Launch” or normal user launch)
overwolf.extensions.onAppLaunchTriggered.addListener(() => {
  console.log("🚀 onAppLaunchTriggered fired!");

  // Fire up the Discord RPC server
  overwolf.extensions.launchExternalFile(
    { id: "discordRpcServer" },
    launchRes => {
      console.log("🛠  launchExternalFile result:", launchRes);
      if (!launchRes.success) {
        console.error("Failed to launch Discord RPC server:", launchRes);
      } else {
        console.log("Discord RPC server started:", launchRes);
      }
    }
  );

  // 2) Open your overlay windows
  const windowsToOpen = ['overlayDesktop', 'overlayGame'];
  overwolf.utils.getMonitorsList(monRes => {
    if (monRes.status !== 'success') {
      return console.error('getMonitorsList failed:', monRes);
    }
    const primary = monRes.monitors.find(m => m.primary);
    if (!primary) {
      return console.error('No primary monitor found.');
    }

    windowsToOpen.forEach(name => {
      overwolf.windows.obtainDeclaredWindow(name, odw => {
        if (odw.status !== 'success') {
          return console.error(`obtainDeclaredWindow(${name})`, odw);
        }
        const winId = odw.window.id;

        overwolf.windows.restore(winId, res => {
          if (res.status !== 'success') {
            return console.error(`restore(${name})`, res);
          }

          // Move & resize
          overwolf.windows.changePosition(winId, 0, 0, posRes => {
            if (posRes.status !== 'success') {
              console.error(`changePosition(${name})`, posRes);
            }
          });
          overwolf.windows.changeSize(winId, primary.width, primary.height, sizeRes => {
            if (sizeRes.status !== 'success') {
              console.error(`changeSize(${name})`, sizeRes);
            }
          });

          // For in-game overlay, force front
          if (name === 'overlayGame') {
            overwolf.windows.bringToFront(winId, bfRes => {
              if (bfRes.status !== 'success') {
                console.error(`bringToFront(${name})`, bfRes);
              }
            });
          }
        });
      });
    });
  });
});

// 3) Allow the overlay to ask us to launch the RPC server
overwolf.extensions.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "launchRpc") {
    console.log("📨 Received launchRpc message from overlay");
    overwolf.extensions.launchExternalFile(
      { id: "discordRpcServer" },
      res => {
        console.log("🛠 launchExternalFile result:", res);
        sendResponse(res);
      }
    );
    // return true so sendResponse can be called asynchronously
    return true;
  }
});
