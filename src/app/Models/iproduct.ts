export interface IProduct {

  id: number;

  name: string;

  price: number;

  

  // image
  imageUrl?: string;
  imageone?: string;
  imagetwo?: string;
  imagethree?: string;
  imagefour?: string;
  imagefive?: string;

  averageRating?: number;
  reviews?: number;
  reviewCount?: number;
  stockQuantity?: number;

  Overview?: string;

  description: string;
  SuggestedUse?: string;
  Warnings?: string;
  Disclaimer?: string;

  // new arrival
  CreatedAt: Date;  
  // trending now
  QuantitySold : number; 
  
// product category
 ProductCategories?: string[];
  brandId: number;

  
 
}
