export interface Product {
   id?: number;
   name: string;
   coverImageUrl: string;
   coverImagePublicId: string;
   imageUrls: Record<string, string>;
   code: string;
   description: string;
   stock: number;
   price: number;
   categoryName: string;
   rating: number;
   totalReviews: number;
   isAvailable: boolean;
   deleted: boolean;
   soldCount: number;
   createdAt: string;
}
