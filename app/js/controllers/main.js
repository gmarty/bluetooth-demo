import { Controller } from 'components/fxos-mvc/dist/mvc';

import HomeController from 'js/controllers/home';

import Settings from 'js/models/settings';

var bluetoothManager = navigator.mozBluetooth;

var displayError = error => {
  var message = (error.message || error.name || 'Unknown error');
  console.error(message);
};

export default
class MainController extends Controller {
  constructor() {
    console.log('MainController#constructor()');

    this.settings = new Settings();

    this.controllers = {
      home: new HomeController({settings: this.settings})
    };
    this.adapter = null;

    this.init();
  }

  init() {
    console.log('MainController#init()');

    // Attach event listeners.
    bluetoothManager.addEventListener('enabled', this);
    bluetoothManager.addEventListener('disabled', this);
    bluetoothManager.addEventListener('adapteradded', this);
  }

  main() {
    console.log('MainController#main()');

    this.enable();
    this.setActiveController('home');
  }

  setActiveController(controllerName) {
    if (this.activeController === this.controllers[controllerName]) {
      return;
    }

    if (this.activeController) {
      this.activeController.teardown();
    }

    this.activeController = this.controllers[controllerName];
    this.activeController.main();
  }

  enable() {
    console.log('MainController#enable()');

    var lock = navigator.mozSettings.createLock();
    var req = lock.set({
      'bluetooth.enabled': true
    });

    req.onsuccess = () => {
      this.getDefaultAdapter();
    };

    req.onerror = evt => {
      displayError(evt.target.error);
    };
  }

  getDefaultAdapter() {
    console.log('MainController#getDefaultAdapter()');

    var req = bluetoothManager.getDefaultAdapter();

    req.onsuccess = evt => {
      console.log('bluetoothManager#getDefaultAdapter().onsuccess');

      this.setDefaultAdapter(evt.target.result);
    };

    req.onerror = evt => {
      displayError(evt.target.error);
    };
  }

  setDefaultAdapter(adapter) {
    console.log('MainController#setDefaultAdapter()');

    this.adapter = adapter;
    window.adapter = adapter;

    // Attach event listeners.
    this.adapter.addEventListener('devicefound', this);
    this.adapter.addEventListener('discoverystatechanged', this);
    this.adapter.addEventListener('pairedstatuschanged', this);
    this.adapter.addEventListener('a2dpstatuschanged', this);
    this.adapter.addEventListener('hfpstatuschanged', this);
    this.adapter.addEventListener('scostatuschanged', this);
    this.adapter.addEventListener('requestmediaplaystatus', this);

    console.log(this.adapter);

    this.setDeviceName();
    this.startDiscovery();
  }

  setDeviceName() {
    console.log('MainController#setDeviceName()');

    if (!this.adapter) {
      return;
    }

    var req = this.adapter.setName(this.settings.deviceName);

    req.onsuccess = evt => {
      console.log('BluetoothAdapter#setName().onsuccess');

      console.log(evt);
    };

    req.onerror = evt => {
      displayError(evt.target.error);
    };
  }

  startDiscovery() {
    console.log('MainController#startDiscovery()');

    if (!this.adapter) {
      return;
    }

    this.settings.peers = [];

    var req = this.adapter.startDiscovery();

    req.onsuccess = evt => {
      console.log('BluetoothAdapter#startDiscovery().onsuccess');

      console.log(evt);
    };

    req.onerror = evt => {
      displayError(evt.target.error);
    };
  }

  /**
   * General handler for event listeners.
   *
   * @param {Object} evt
   */
  handleEvent(evt) {
    console.log(evt.type, evt);

    switch (evt.type) {
      case 'enabled':
      case 'disabled':
      case 'adapteradded':
        break;

      case 'discoverystatechanged':
        this.controllers.home.view.discovering.classList.toggle('not', !evt.discovering);
        break;

      case 'devicefound':
        var device = {
          address: evt.device.address,
          'class': evt.device.class,
          connected: evt.device.connected,
          icon: evt.device.icon,
          name: evt.device.name,
          paired: evt.device.paired
        };

        if (!device.name) {
          device.name = '[No name]';
        }

        this.settings.peers.push(device);
        // @todo Fix it. The observer should work here.
        this.controllers.home.view.renderPeer(this.settings.peers);
        break;

      case 'pairedstatuschanged':
      case 'a2dpstatuschanged':
      case 'hfpstatuschanged':
      case 'scostatuschanged':
      case 'requestmediaplaystatus':
        break;
    }
  }
}
