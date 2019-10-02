import { MeasurementUnits } from '@app/models/enums/measurement-units.enum';
import { MeasurableContainer } from '@app/models/base/measurable-container.model';
import { convertMetersToFeet, convertFeetToMeters } from '@app/helpers/unit-conversion.helper';

export class CalculationOutputs extends MeasurableContainer {
    static readonly MEASURABLES = {
        distanceBetweenMicrophones: 0,
        microphoneAudienceDistance: 0,
        ceilingExtenderLength: 0
    }

    private _numMicrophones: number = 0;
    private m_distanceBetweenMicrophones: number = CalculationOutputs.MEASURABLES.distanceBetweenMicrophones;
    private m_microphoneAudienceDistance: number = CalculationOutputs.MEASURABLES.microphoneAudienceDistance;
    private m_ceilingExtenderLength: number = CalculationOutputs.MEASURABLES.ceilingExtenderLength;

    constructor(obj?: any) {
        super(obj);
    }
}