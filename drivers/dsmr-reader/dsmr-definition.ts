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
    // Current day consumption
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
        topic: 'dsmr/day-consumption/electricity_cost_merged',
        capability: 'costs_electricity_merged',
        conversion: Conversion.toNumber
    },        {
        topic: 'dsmr/day-consumption/electricity1_cost',
        capability: 'costs_electricity_low',
        conversion: Conversion.toNumber
    },    
    {
        topic: 'dsmr/day-consumption/electricity2_cost',
        capability: 'costs_electricity_high',
        conversion: Conversion.toNumber
    }, 
    {
        topic: 'dsmr/day-consumption/fixed_cost',
        capability: 'costs_fixed',
        conversion: Conversion.toNumber
    },        
    {
        topic: 'dsmr/day-consumption/gas_cost',
        capability: 'costs_gas',
        conversion: Conversion.toNumber
    },    
    {
        topic: 'dsmr/day-consumption/total_cost',
        capability: 'costs_total',
        conversion: Conversion.toNumber
    },    

    // Current year consumption
    {
        topic: 'dsmr/current-year/gas',
        capability: 'meter_gas_year',
        conversion: Conversion.toNumber
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

    // Current
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


]