import Homey from 'homey';
import { PairSession } from 'homey/lib/Driver';
import { connectAsync } from 'mqtt';

interface TestPairingResult {
  success: boolean;
  message?: unknown;
}

class DsmrDriver extends Homey.Driver {

  host: string = '';
  port: string = '';
  username: string | undefined = undefined;
  password: string | undefined = undefined;
  topic: string = '';

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('DsmrDriver has been initialized');
  }

  async _testPairing(data: any, session: PairSession): Promise<TestPairingResult> {
    if (data.host && data.port) {
      this.host = data.host;
      this.port = data.port ?? '1883';
      this.username = data.username;
      this.password = data.password;

      try {
        this.log('Connecting to broker at ', this.host);
        const connection = await connectAsync(`mqtt://${this.host}`, {
          username: this.username,
          password: this.password,
          port: Number(this.port),
        });

        if (connection.connected) {
          this.log('Connected succesfully, closing connection');

          connection.end();
          await session.nextView();

          return {
            success: true,
          };
        }
        this.log('Not connected?');
        return {
          success: false,
          message: 'Unable to connect, unknown error',
        };
      } catch (error) {
        this.log('Failed to connect with error', error);
        return {
          success: false,
          message: error,
        };
      }
    } else {
      return {
        success: false,
        message: 'Missing host and port',
      };
    }
  }

  async onPair(session: PairSession) {
    await session.done();

    session.setHandler('form_complete', async (data) => {
      this.log('Calling testPairing with ', data);
      return this._testPairing(data, session);
    });

    session.setHandler('showView', async (view) => {
    });

    session.setHandler('list_devices', async () => {
      return [
        {
          name: 'DSMR Reader MQTT',
          data: {
            id: `${this.username}:${this.password}@${this.host}:${this.port}`,
          },
          settings: {
            host: this.host,
            port: this.port,
            username: this.username,
            password: this.password,
          },
        },
      ];
    });
  }

  /**
   * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    return [
      // Example device data, note that `store` is optional
      // {
      //   name: 'My Device',
      //   data: {
      //     id: 'my-device',
      //   },
      //   store: {
      //     address: '127.0.0.1',
      //   },
      // },
    ];
  }

}

module.exports = DsmrDriver;
