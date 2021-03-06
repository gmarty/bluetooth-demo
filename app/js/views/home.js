import { View } from 'components/fxos-mvc/dist/mvc';

var template = `
  <button id="discover">Search<br/><div class="small progress" hidden><div>Loading…</div></div></button>
  <div id="peers"></div>
  `;

var noPeersTemplate = `
  <div class="no-peers">No peers around</div>
  `;

var peersTemplate = peer => `
  <div
    data-address="${peer.address}"
    data-class="${peer.class}"
    data-connected="${peer.connected}"
    data-icon="${peer.icon}"
    data-name="${peer.name}"
    data-paired="${peer.paired}"
  >${peer.name}</div>
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

    this.discover = this.$('#discover');
    this.loader = this.$('.progress');
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
