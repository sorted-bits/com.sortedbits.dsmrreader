import Homey from 'homey';
import { MqttClient, connect } from 'mqtt';
import { Conversion, DsmrDefinition, DsmrDefinitions } from './dsmr-definition';

class DsmrReader extends Homey.Device {

  client: MqttClient | undefined = undefined;
  latestData: Record<string, any> = {};

  toNumber(value: string): number {
    const result = Number(value);
    return result;
  }

  kwToW(value: string): number {
    const v = Number(value) * 1000;
    return v;
  }

  netCalculation(definition: DsmrDefinition): number | undefined {
    if (definition.returned === undefined) {
      return undefined;
    }
    if (this.latestData[definition.topic] === undefined) {
      return undefined;
    }
    if (this.latestData[definition.returned] === undefined) {
      return undefined;
    }

    const result = this.latestData[definition.topic]
      - this.latestData[definition.returned];

    return result;
  }

  parseData = async (topic: string, data: Buffer) => {
    const definitions = DsmrDefinitions.filter((d) => d.topic === topic || d.returned === topic);

    for (const definition of definitions) {
      if (!definition) {
        this.error('Could not find topic definition', topic);
        return;
      }

      let result: any | undefined;

      switch (definition.conversion) {
        case Conversion.toNumber: {
          result = this.toNumber(data.toString());
          break;
        }
        case Conversion.kWtoW: {
          result = this.kwToW(data.toString());
          break;
        }
        case Conversion.CalculateNet: {
          result = this.netCalculation(definition);
          break;
        }
        default: {
          this.log('No conversion found for', definition.conversion);
          break;
        }
      }

      if (result !== undefined) {
        if (definition.conversion !== Conversion.CalculateNet) {
          if (definition.topic === topic) {
            this.latestData[topic] = result;
          } else if (definition.returned === topic) {
            this.latestData[definition.topic] = result;
          }
        }

        await this.setCapabilityValue(definition.capability, result);
      }
    }
  }

  async connectToMqtt() {
    const {
      host, port, username, password, protocol, validateCertificate,
    } = this.getSettings();

    if (this.client && this.client.connected) {
      this.client.end();
    }

    const broker = `${protocol ?? 'mqtt'}://${host}:${port ?? 1883}`;
    this.log(`Connecting to broker ${broker}`);

    const client = connect(`${protocol ?? 'mqtt'}://${host}`, {
      username,
      password,
      port: Number(port),
      rejectUnauthorized: validateCertificate ?? true,
    });

    if (client.connected) {
      this.log('Client connected');
    }

    client.on('connect', () => {
      this.client = client;

      const topics = DsmrDefinitions.map((def) => def.topic);

      const dependencies: string[] = [];
      DsmrDefinitions.forEach((def) => {
        if (def.returned) {
          dependencies.push(def.returned);
        }
      });

      const allTopics = [
        ...topics,
        ...dependencies,
      ];

      client.subscribe(allTopics, () => {
        this.log(`Succesfully subscribed to ${allTopics.length} topics`);
      });
    });

    client.on('message', (topic, data, packet) => {
      this.parseData(topic, data)
        .catch((error) => {
          this.error('Error while parsing data', error);
        });
    });

    client.on('disconnect', () => {
      this.log('Disconnected from broker');
    });
  }

  async checkCapability(capabilityName: string) {
    if (this.hasCapability(capabilityName) === false) {
      await this.addCapability(capabilityName);
    }
  }

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('DsmrReader has been initialized');

    await this.checkCapability('costs_electricity_high');
    await this.checkCapability('costs_electricity_low');
    await this.checkCapability('costs_electricity_merged');
    await this.checkCapability('costs_fixed');
    await this.checkCapability('costs_gas');
    await this.checkCapability('costs_total');

    await this.checkCapability('measure_power_net');
    await this.checkCapability('measure_power_returned');

    await this.checkCapability('meter_gas_year');
    await this.checkCapability('meter_power_net_year');
    await this.checkCapability('meter_power_net');
    await this.checkCapability('meter_power_returned');
    await this.checkCapability('meter_power_year_delivered');
    await this.checkCapability('meter_power_year_returned');

    await this.connectToMqtt();
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('DsmrReader has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({
    oldSettings,
    newSettings,
    changedKeys,
  }: {
    oldSettings: { [key: string]: boolean | string | number | undefined | null };
    newSettings: { [key: string]: boolean | string | number | undefined | null };
    changedKeys: string[];
  }): Promise<string | void> {
    this.log('DsmrReader settings where changed');

    await this.connectToMqtt();
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name: string) {
    this.log('DsmrReader was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    if (this.client && this.client.connected) {
      this.log('Disconnecting from MQTT broker');
      this.client.end();
    }

    this.log('DsmrReader has been deleted');
  }

}

module.exports = DsmrReader;
