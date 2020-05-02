import { TestBed } from '@angular/core/testing';

import { StemmerService } from './stemmer.service';

describe('StemmerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StemmerService = TestBed.get(StemmerService);
    expect(service).toBeTruthy();
  });
});
