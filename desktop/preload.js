'use strict';

const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('desktopApp', {
  platform: 'windows',
  isDesktop: true,
});
