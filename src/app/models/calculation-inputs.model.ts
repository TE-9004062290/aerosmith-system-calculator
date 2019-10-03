import { MeasurementUnits } from '@app/models/enums/measurement-units.enum';
import { MeasurableContainer } from '@app/models/base/measurable-container.model';
import { convertMetersToFeet, convertFeetToMeters } from '@app/helpers/unit-conversion.helper';

export class CalculationInputs extends MeasurableContainer {
    protected static readonly MEASURABLES = {
        ceilingHeight: 2.5,
        lectureWidth: 4,
        presenterHeight: 1.5,
        audienceHeight: 1.5
    };

    private m_ceilingHeight: number = CalculationInputs.MEASURABLES.ceilingHeight;
    private m_lectureWidth: number = CalculationInputs.MEASURABLES.lectureWidth;
    private m_presenterHeight: number = CalculationInputs.MEASURABLES.presenterHeight;
    private m_audienceHeight: number = CalculationInputs.MEASURABLES.audienceHeight;

    constructor(obj?: any) {
        super(obj);
    }
}