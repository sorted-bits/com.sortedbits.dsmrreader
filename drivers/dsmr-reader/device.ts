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

  netCalculation(definition: DsmrDefinition, topic: string): number | undefined {
    if (definition.dependencies === undefined) {
      return undefined;
    }
    if (this.latestData[definition.dependencies.delivered] == undefined) {
      return undefined;
    }
    if (this.latestData[definition.dependencies.returned] == undefined) {
      return undefined;
    }

    const result = this.latestData[definition.dependencies.delivered] -
      this.latestData[definition.dependencies.returned];

    return result;
  }

  async parseData(topic: string, data: Buffer) {
    const baseTopic = this.getSetting('topic') ?? 'dsmr';

    if (!topic.startsWith(`${baseTopic}/`)) {
      this.error('Unknown topic received', topic);
    }

    const cleanTopic = topic.substring(baseTopic.length + 1);

    const definitions = DsmrDefinitions.filter(d => d.topic === cleanTopic);

    // We should also find definitions where this topic is a dependency
    // To make the results more responsive

    definitions.forEach(definition => {
      if (!definition) {
        this.error('Could not find topic definition', cleanTopic);
        return;
      }

      let result: any | undefined = undefined;

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
          result = this.netCalculation(definition, cleanTopic);
          this.log('net calculation?', definition.capability, result);
          break;
        }
      }

      if (result !== undefined) {
        this.latestData[cleanTopic] = result;
        this.setCapabilityValue(definition.capability, result);
      }

    });
  }

  async connectToMqtt() {

    const host = this.getSetting('host');
    const port = this.getSetting('port') ?? 1883;
    const topic = this.getSetting('topic') ?? 'dsmr';
    const username = this.getSetting('username');
    const password = this.getSetting('password');

    if (this.client && this.client.connected) {
      this.client.end();
    }

    const broker = `${host}:${port}`;
    this.log(`Connecting to broker ${broker}`);

    const client = connect(`mqtt://${host}`, {
      username: username,
      password: password,
      port: Number(port),
    })

    if (client.connected) {
      this.log('Client connected');
    }

    client.on('connect', () => {
      this.log(`Connected to broker, subscribing to ${topic}`);
      this.client = client;

      const topics = DsmrDefinitions.map(def => `${topic}/${def.topic}`);

      const dependencies: string[] = [];
      DsmrDefinitions.forEach(def => {
        if (def.dependencies) {
          dependencies.push(def.dependencies.delivered);
          dependencies.push(def.dependencies.returned);
        }
      });

      const allTopics = [
        ...topics,
        ...dependencies
      ];

      client.subscribe(allTopics, () => {
        this.log(`Succesfully subscribed to ${allTopics.length} topics`)
      });
    });

    client.on('message', (topic, data, packet) => {
      this.parseData(topic, data);
    })

    client.on('disconnect', () => {
      this.log('Disconnected from broker');
    })
  }

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('DsmrReader has been initialized');

    this.connectToMqtt();
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
    this.log("DsmrReader settings where changed");

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
      this.log(`Disconnecting from MQTT broker`);
      this.client.end();
    }

    this.log('DsmrReader has been deleted');
  }

}

module.exports = DsmrReader;