'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopApp', {
  platform: 'windows',
  isDesktop: true,
  checkSubscription: () => ipcRenderer.invoke('check-subscription'),
  manageSubscription: () => ipcRenderer.send('manage-subscription'),
});
