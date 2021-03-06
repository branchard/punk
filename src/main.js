var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var appMenu = require('./ui/menus/app-menu.js');

var Logger = require('./utils/logger.js')('main');
var Settings = require('./utils/settings.js');

// get this working later? requires submit URL
// require('crash-reporter').start();

var mainWindow = null;
var title = app.getName() + ' [v' + app.getVersion() + ']';
var WINDOW_STATE_KEY = 'lastMainWindowState';

app.on('window-all-closed', function() {
  if(process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  Settings.get(WINDOW_STATE_KEY, function(err, data) {
    var lastWindowsState = err && { width: 800, height: 600 } || data;

    mainWindow = new BrowserWindow({
      x: lastWindowsState.x,
      y: lastWindowsState.y,
      width: lastWindowsState.width,
      height: lastWindowsState.height,
      minWidth: 400,
      minHeight: 300,
      autoHideMenuBar: true
    });

    mainWindow.loadURL('file://' + __dirname + '/../../static/index.html');

    mainWindow.on('closed', function() {
      mainWindow = null;
    });

    mainWindow.webContents.on('did-finish-load', function() {
      mainWindow.setTitle(title);
      if(lastWindowsState.maximized) {
        mainWindow.maximize();
      }
    });

    mainWindow.on('focus', function() {
      mainWindow.flashFrame(false);
    });

    function preserveWindowState() {
      var currentWindowsState = mainWindow.getBounds();
      currentWindowsState.maximized = mainWindow.isMaximized();

      Settings.set(WINDOW_STATE_KEY, currentWindowsState, function(setErr) {
        if(setErr) {
          Logger.error('Failed to save last window state.');
          Logger.error(setErr);
        }
      });
    }

    mainWindow.on('move', preserveWindowState);
    mainWindow.on('resize', preserveWindowState);
    mainWindow.on('maximize', preserveWindowState);
    mainWindow.on('unmaximize', preserveWindowState);

    // register main app menu
    appMenu.register();
  });
});
