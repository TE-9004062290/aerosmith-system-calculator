
import { MeasurementUnits } from '@app/models/enums/measurement-units.enum';
import { convertMetersToFeet, convertFeetToMeters } from '@app/helpers/unit-conversion.helper';

export class CalculationInputs {

    static readonly MEASURABLES = {
        ceilingHeight: 0,
        lectureWidth: 0,
        presenterHeight: 0,
        audienceHeight: 0
    };

    private _measurementUnit: MeasurementUnits = MeasurementUnits.Meters;
    private m_ceilingHeight: number = CalculationInputs.MEASURABLES.ceilingHeight;
    private m_lectureWidth: number = CalculationInputs.MEASURABLES.lectureWidth;
    private m_presenterHeight: number = CalculationInputs.MEASURABLES.presenterHeight;
    private m_audienceHeight: number = CalculationInputs.MEASURABLES.audienceHeight;

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
              Object.keys(CalculationInputs.MEASURABLES).forEach(propName => {
                  this[propName] = conversionFunc(this[propName]);
              });
        }
    }

    private isValidProp(incomingObject, propName) {
        if (incomingObject) {
            const propExistsOnObj = () => !!incomingObject[propName];
            const propIsSameType = () => typeof(this[propName]) === typeof(incomingObject[propName]);
            const propGreaterThanDefault = () => incomingObject[propName] >= CalculationInputs.MEASURABLES[propName];
            return propExistsOnObj() && propIsSameType() && propGreaterThanDefault();
        }
        return false;
    }

    private initGettersAndSetters() {
        Object.keys(CalculationInputs.MEASURABLES).forEach(propName => {
            Object.defineProperty(this, propName, {                                           
                get: () => this[`m_${propName}`],                       
                set: (val: any) => {    
                    if (val && typeof(val) === "number" && val > CalculationInputs.MEASURABLES[propName]) {
                        this[`m_${propName}`] = val;
                    }                                                                                                                    
                }
            });    
        });
    }
}