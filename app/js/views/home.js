import { View } from 'components/fxos-mvc/dist/mvc';

var template = `
  <h1>Bluetooth</h1>
  <div id="discovering" class="not">Discovering</div>
  <div id="peers"></div>
  `;

var noPeersTemplate = `
  <input type="button" value="No peers around">
  `;

var peersTemplate = peer => `
  <input type="button" value="${peer.name}"
  data-name="${peer.name}"
  data-address="${peer.address}"
  data-paired="${peer.paired}"
  data-connected="${peer.connected}"
  data-class="${peer.class}">
  `;

export default
class HomeView extends View {
  constructor(options) {
    console.log('HomeView#constructor()');

    super(options);
  }

  init(controller) {
    console.log('HomeView#init()');

    super(controller);
    this.render();

    this.discovering = this.$('#discovering');
    this.peersList = this.$('#peers');

    this.renderPeer();
  }

  render() {
    console.log('HomeView#render()');

    super();
  }

  template() {
    return template;
  }

  setActive(active) {
    this.el.classList.toggle('active', active);
  }

  // Called whenever settings.peers changes.
  renderPeer(peers = []) {
    console.log('HomeView#renderPeer()', peers);

    // Clear child elements.
    while (this.peersList.firstChild) {
      this.peersList.removeChild(this.peersList.firstChild);
    }

    var htmlContent = '';

    peers.forEach(peer => {
      htmlContent += peersTemplate(peer);
    });

    // None peers can be connected to.
    if (htmlContent === '') {
      htmlContent = noPeersTemplate;
    }

    this.peersList.innerHTML = htmlContent;
  }
}
