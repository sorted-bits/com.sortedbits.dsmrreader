export enum Conversion {
    None,
    toNumber,
    kWtoW,
    TimestampToDate,
    CalculateNet
}

export interface DsmrDefinition {
    topic: string,
    capability: string,
    conversion: Conversion;
    returned?: string;
}

export const DsmrDefinitions: DsmrDefinition[] = [
    {
        topic: 'dsmr/current-year/gas',
        capability: 'meter_gas_year',
        conversion: Conversion.toNumber
    },
    {
        topic: 'dsmr/reading/electricity_currently_delivered',
        capability: 'measure_power',
        conversion: Conversion.kWtoW
    },
    {
        topic: 'dsmr/reading/electricity_currently_returned',
        capability: 'measure_power_returned',
        conversion: Conversion.kWtoW
    },
    {
        topic: 'dsmr/reading/electricity_currently_delivered',
        capability: 'measure_power_net',
        conversion: Conversion.CalculateNet,
        returned: 'dsmr/reading/electricity_currently_returned'
    },
    {
        topic: 'dsmr/day-consumption/gas',
        capability: 'meter_gas',
        conversion: Conversion.toNumber
    },
    {
        topic: 'dsmr/day-consumption/electricity_merged',
        capability: 'meter_power',
        conversion: Conversion.toNumber
    },
    {
        topic: 'dsmr/day-consumption/electricity_returned_merged',
        capability: 'meter_power_returned',
        conversion: Conversion.toNumber
    },
    {
        topic: 'dsmr/day-consumption/electricity_merged',
        capability: 'meter_power_net',
        conversion: Conversion.CalculateNet,
        returned: 'dsmr/day-consumption/electricity_returned_merged'
    },
    {
        topic: 'dsmr/current-year/electricity_merged',
        capability: 'meter_power_year_delivered',
        conversion: Conversion.toNumber
    },
    {
        topic: 'dsmr/current-year/electricity_returned_merged',
        capability: 'meter_power_year_returned',
        conversion: Conversion.toNumber
    },
    {
        topic: 'dsmr/current-year/electricity_merged',
        capability: 'meter_power_net_year',
        conversion: Conversion.CalculateNet,
        returned: 'dsmr/current-year/electricity_returned_merged'
    },
]