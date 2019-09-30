const feetPerMeter = 3.28084;
const metersPerFeet = 0.3048;

export function convertMetersToFeet(meters: number): number {
    return meters * feetPerMeter;
}

export function convertFeetToMeters(feet: number): number {
    return feet / feetPerMeter;
}