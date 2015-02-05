import { Controller } from 'components/fxos-mvc/dist/mvc';

import HomeView from 'js/views/home';

export default
class HomeController extends Controller {
  constructor(options) {
    console.log('HomeController#constructor()');

    this.view = new HomeView({
      el: document.getElementById('home')
    });
    super(options);
  }

  main() {
    console.log('HomeController#main()');

    this.view.setActive(true);
  }

  teardown() {
    console.log('HomeController#teardown()');

    this.view.setActive(false);
  }
}
