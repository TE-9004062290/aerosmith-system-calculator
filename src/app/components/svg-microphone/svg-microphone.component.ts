import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { SoundReinforcementPriority } from '@app/models/enums/sound-reinforcement-priority.enum';

@Component({
    selector: 'app-svg-microphone',
    templateUrl: './svg-microphone.component.html',
    styleUrls: ['./svg-microphone.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SvgMicrophoneComponent implements OnInit {

  public static readonly WIDTH_HEIGHT_RATIO = 0.3463406889982537;
  public SoundReinforcementPriorityEnum = SoundReinforcementPriority;

  @Input() mode: 'reinforcement' | 'audienceRecording' | 'presenterRecording' = 'reinforcement';
  @Input() displayRadius: boolean = true;
  @Input() extenderLength: number = 0;
  @Input() soundReinforcementPriority: SoundReinforcementPriority = SoundReinforcementPriority.AudioQuality;

  constructor() { }

  ngOnInit() {
  }
}

