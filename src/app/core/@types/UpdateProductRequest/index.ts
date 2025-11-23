export interface UpdateProductRequest {
   name: string;
   description: string;
   stock: number;
   categoryName: string;
   price: number;
   publicIdsToDelete: string[];
}
