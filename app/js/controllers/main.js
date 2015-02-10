import { Controller } from 'components/fxos-mvc/dist/mvc';

import HomeController from 'js/controllers/home';

import Settings from 'js/models/settings';

import /* global _ */ 'components/lodash/lodash.min';

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
    this.controllers.home.view.discover.addEventListener('click', this);
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

    navigator.mozSettings.createLock().set({'bluetooth.enabled': true})
      .then(() => {
        console.log('mozSettings#createLock().then()');
      })
      .catch(displayError);
  }

  getDefaultAdapter() {
    console.log('MainController#getDefaultAdapter()');

    bluetoothManager.getDefaultAdapter()
      .then((result) => {
        console.log('bluetoothManager#getDefaultAdapter().then()');

        if (!result) {
          displayError(new Error('Cannot get default adapter.'));
          return;
        }

        this.setDefaultAdapter(result);
      })
      .catch(displayError);
  }

  setDefaultAdapter(adapter) {
    console.log('MainController#setDefaultAdapter()');

    this.adapter = adapter;

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
    this.setDiscoverable();
    this.startDiscovery();
  }

  setDeviceName() {
    console.log('MainController#setDeviceName()');

    if (!this.adapter) {
      return;
    }

    this.adapter.setName(this.settings.deviceName)
      .then(() => {
        console.log('BluetoothAdapter#setName().then()');
      })
      .catch(displayError);
  }

  setDiscoverable() {
    console.log('MainController#setDiscoverable()');

    if (!this.adapter) {
      return;
    }

    this.adapter.setDiscoverable(true)
      .then(() => {
        console.log('BluetoothAdapter#setDiscoverable().then()');
      })
      .catch(displayError);
  }

  startDiscovery() {
    console.log('MainController#startDiscovery()');

    if (!this.adapter) {
      return;
    }

    this.settings.peers = [];

    this.adapter.startDiscovery()
      .then(() => {
        console.log('BluetoothAdapter#startDiscovery().then()');
      })
      .catch(displayError);
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
        this.getDefaultAdapter();
        break;

      case 'disabled':
      case 'adapteradded':
        break;

      case 'discoverystatechanged':
        if (evt.discovering) {
          this.controllers.home.view.loader.hidden = false;
          break;
        }

        this.controllers.home.view.loader.hidden = true;
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

        // There's no such event as `devicelost` so we need to dedupe in case
        // a peer is found several times.
        this.settings.peers = _.uniq(this.settings.peers, peer => peer.address);
        break;

      case 'pairedstatuschanged':
      case 'a2dpstatuschanged':
      case 'hfpstatuschanged':
      case 'scostatuschanged':
      case 'requestmediaplaystatus':
        break;

      case 'click':
        switch (evt.target) {
          case this.controllers.home.view.discover:
            if (this.adapter.discovering) {
              break;
            }

            this.startDiscovery();
            break;
        }
        break;
    }
  }
}
