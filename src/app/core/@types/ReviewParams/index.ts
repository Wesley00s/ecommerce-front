export interface ReviewParams {
   sortField?: 'createdAt' | 'rating';
   direction?: 'ASC' | 'DESC';
   page?: number;
   size?: number;
}
