import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let component: PaginationComponent;

  beforeEach(() => {
    component = new PaginationComponent();
  });

  it('calculates the visible record range', () => {
    component.currentPage = 4;
    component.pageSize = 10;
    component.totalItems = 37;

    expect(component.totalPages).toBe(4);
    expect(component.firstVisibleItem).toBe(31);
    expect(component.lastVisibleItem).toBe(37);
  });

  it('adds ellipses without rendering every page', () => {
    component.currentPage = 5;
    component.pageSize = 10;
    component.totalItems = 100;

    expect(component.paginationItems.map((item) => item.page)).toEqual([
      1,
      null,
      4,
      5,
      6,
      null,
      10,
    ]);
  });

  it('only emits valid page changes', () => {
    component.currentPage = 1;
    component.pageSize = 10;
    component.totalItems = 37;
    const emittedPages: number[] = [];
    component.pageChange.subscribe((page) => emittedPages.push(page));

    component.previousPage();
    component.selectPage(1);
    component.nextPage();

    expect(emittedPages).toEqual([2]);
  });
});
