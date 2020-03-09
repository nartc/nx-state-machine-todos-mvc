import { async, TestBed } from '@angular/core/testing';
import { NgCommonModule } from './ng-common.module';

describe('NgCommonModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgCommonModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(NgCommonModule).toBeDefined();
  });
});
