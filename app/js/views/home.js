import { View } from 'components/fxos-mvc/dist/mvc';

var template = `
  <h1>Bluetooth</h1>
  <div id="discovering" class="not">Discovering</div>
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
}
