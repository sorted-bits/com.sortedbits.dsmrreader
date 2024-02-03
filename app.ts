'use strict';

import Homey from 'homey';

class DsmrReader extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('DSMR Reader has been initialized');
  }

}

module.exports = DsmrReader;
