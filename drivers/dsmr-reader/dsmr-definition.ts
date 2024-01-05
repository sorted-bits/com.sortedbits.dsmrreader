export enum Conversion {
    None,
    toNumber,
    kWtoW,
    TimestampToDate,
    CalculateNet
}

export interface DsmrDependencies {
    delivered: string,
    returned: string
}

export interface DsmrDefinition {
    topic: string,
    capability: string,
    conversion: Conversion;
    dependencies?: DsmrDependencies;
}

export const DsmrDefinitions: DsmrDefinition[] = [
    {
        topic: 'current-year/gas',
        capability: 'meter_gas_year',
        conversion: Conversion.toNumber
    },       
    {
        topic: 'reading/electricity_currently_delivered',
        capability: 'measure_power',
        conversion: Conversion.kWtoW
    },  
    {
        topic: 'reading/electricity_currently_returned',
        capability: 'measure_power_returned',
        conversion: Conversion.kWtoW
    },
    {
        topic: 'reading/electricity_currently_delivered',
        capability: 'measure_power_net',
        conversion: Conversion.CalculateNet,
        dependencies: {
            delivered: 'reading/electricity_currently_delivered',
            returned: 'reading/electricity_currently_returned'
        }
    },
    {
        topic: 'day-consumption/gas',
        capability: 'meter_gas',
        conversion: Conversion.toNumber
    },    
    {
        topic: 'day-consumption/electricity_merged',
        capability: 'meter_power',
        conversion: Conversion.toNumber
    },      
    {
        topic: 'day-consumption/electricity_returned_merged',
        capability: 'meter_power_returned',
        conversion: Conversion.toNumber
    },       
    {
        topic: 'day-consumption/electricity_merged',
        capability: 'meter_power_net',
        conversion: Conversion.CalculateNet,
        dependencies: {
            delivered: 'day-consumption/electricity_merged',
            returned: 'day-consumption/electricity_returned_merged'
        }
    },
    {
        topic: 'current-year/electricity_merged',
        capability: 'meter_power_year_delivered',
        conversion: Conversion.toNumber
    },      
    {
        topic: 'current-year/electricity_returned_merged',
        capability: 'meter_power_year_returned',
        conversion: Conversion.toNumber
    },
    {
        topic: 'current-year/electricity_merged',
        capability: 'meter_power_net_year',
        conversion: Conversion.CalculateNet,
        dependencies: {
            delivered: 'current-year/electricity_merged',
            returned: 'current-year/electricity_returned_merged'
        }
    },    
]