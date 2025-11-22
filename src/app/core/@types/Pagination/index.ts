export interface Pagination<T> {
   data: T[];
   pagination: {
      page: number;
      size: number;
      totalElements: number;
      totalPages: number;
   };
}
