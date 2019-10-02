import { MeasurementUnits } from '@app/models/enums/measurement-units.enum';
import { convertMetersToFeet, convertFeetToMeters } from '@app/helpers/unit-conversion.helper';
import { round } from '@app/helpers/arithmetic.helper';

export class MeasurableContainer {

    protected static MEASURABLES = {
    };

    private _measurementUnit: MeasurementUnits = MeasurementUnits.Meters;

    constructor(obj?: any) {
        this.initGettersAndSetters();
        if (obj) {
            const incomingProps = Object.getOwnPropertyNames(obj);
            incomingProps.forEach(p => {
                if (this.isValidProp(obj, p)) {
                    this[p] = obj[p];
                }
            });
        }
    }

    get measurementUnit() { return this._measurementUnit; }
    set measurementUnit(newUnit: MeasurementUnits) {
        if (newUnit !== this._measurementUnit) {
            this._measurementUnit = newUnit;
            const conversionFunc: Function = ((unit) => {
                switch (unit) {
                  case MeasurementUnits.Meters:
                    return convertFeetToMeters;
                  case MeasurementUnits.Feet:
                    return convertMetersToFeet;
                }
              })(newUnit);
              Object.keys((<typeof MeasurableContainer>this.constructor).MEASURABLES).forEach(propName => {
                  this[propName] = round(conversionFunc(this[propName]), 2);
              });
        }
    }

    private isValidProp(incomingObject, propName) {
        if (incomingObject) {
            const propExistsOnObj = () => !!incomingObject[propName];
            const propIsSameType = () => typeof(this[propName]) === typeof(incomingObject[propName]);
            const propGreaterThanDefault = () => incomingObject[propName] >= (<typeof MeasurableContainer>this.constructor).MEASURABLES[propName];
            return propExistsOnObj() && propIsSameType() && propGreaterThanDefault();
        }
        return false;
    }

    private initGettersAndSetters() {
        Object.keys((<typeof MeasurableContainer>this.constructor).MEASURABLES).forEach(propName => {
            Object.defineProperty(this, propName, {                                           
                get: () => this[`m_${propName}`],                       
                set: (val: any) => {    
                    if (val && typeof(val) === "number" && val > (<typeof MeasurableContainer>this.constructor).MEASURABLES[propName]) {
                        this[`m_${propName}`] = round(val, 2);
                    }                                                                                                                    
                }
            });    
        });
    }
}