import { MeasurementUnits } from '@app/models/enums/measurement-units.enum';
import { MeasurableContainer } from '@app/models/base/measurable-container.model';
import { convertMetersToFeet, convertFeetToMeters } from '@app/helpers/unit-conversion.helper';

export class CalculationInputs extends MeasurableContainer {
    protected static readonly MEASURABLES = {
        ceilingHeight: 0,
        lectureWidth: 0,
        presenterHeight: 0,
        audienceHeight: 0
    };

    private m_ceilingHeight: number = CalculationInputs.MEASURABLES.ceilingHeight;
    private m_lectureWidth: number = CalculationInputs.MEASURABLES.lectureWidth;
    private m_presenterHeight: number = CalculationInputs.MEASURABLES.presenterHeight;
    private m_audienceHeight: number = CalculationInputs.MEASURABLES.audienceHeight;

    constructor(obj?: any) {
        super(obj);
    }
}