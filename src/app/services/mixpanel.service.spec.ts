import { TestBed } from '@angular/core/testing';

import { MixpanelService } from './mixpanel.service';

describe('MixpanelService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MixpanelService = TestBed.get(MixpanelService);
    expect(service).toBeTruthy();
  });
});
