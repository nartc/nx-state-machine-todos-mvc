import { async, TestBed } from '@angular/core/testing';
import { NgTodosModule } from './ng-todos.module';

describe('NgTodosModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgTodosModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(NgTodosModule).toBeDefined();
  });
});
