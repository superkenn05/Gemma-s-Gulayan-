import { Product, Category } from '@/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const CATEGORIES: Category[] = [
  { id: 'vegetables', name: 'Vegetables', icon: 'leaf' },
  { id: 'fruits', name: 'Fruits', icon: 'apple' },
  { id: 'nuts', name: 'Nuts', icon: 'nut' },
  { id: 'grains', name: 'Grains', icon: 'wheat' },
  { id: 'organic', name: 'Organic', icon: 'sprout' },
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Red Tomatoes',
    pricePerUnit: 45.00,
    unitOfMeasure: 'kg',
    rating: 4.8,
    reviews: 124,
    imageUrl: PlaceHolderImages.find(img => img.id === 'tomatoes')?.imageUrl || '',
    categoryId: 'vegetables',
    description: 'Fresh and juicy red tomatoes sourced directly from local farmers in Benguet.',
    nutritionalValues: { calories: '18kcal', protein: '0.9g', carbs: '3.9g', fat: '0.2g' },
    currentStockQuantity: 50,
    lowStockThreshold: 10,
    isPopular: true
  },
  {
    id: '2',
    name: 'Yellow Mangoes',
    pricePerUnit: 120.00,
    unitOfMeasure: 'kg',
    rating: 4.9,
    reviews: 89,
    imageUrl: PlaceHolderImages.find(img => img.id === 'mangoes')?.imageUrl || '',
    categoryId: 'fruits',
    description: 'Sweet and aromatic yellow mangoes from Guimaras. The perfect summer treat.',
    nutritionalValues: { calories: '60kcal', protein: '0.8g', carbs: '15g', fat: '0.4g' },
    currentStockQuantity: 30,
    lowStockThreshold: 5,
    isPopular: true
  },
  {
    id: '3',
    name: 'Green Avocado',
    pricePerUnit: 150.00,
    unitOfMeasure: 'kg',
    rating: 4.7,
    reviews: 56,
    imageUrl: PlaceHolderImages.find(img => img.id === 'avocado')?.imageUrl || '',
    categoryId: 'fruits',
    description: 'Rich and creamy avocados, great for salads or smoothies.',
    nutritionalValues: { calories: '160kcal', protein: '2g', carbs: '9g', fat: '15g' },
    currentStockQuantity: 20,
    lowStockThreshold: 5,
    isPopular: true
  },
  {
    id: '4',
    name: 'Fresh Spinach',
    pricePerUnit: 35.00,
    unitOfMeasure: 'bundle',
    rating: 4.5,
    reviews: 42,
    imageUrl: PlaceHolderImages.find(img => img.id === 'spinach')?.imageUrl || '',
    categoryId: 'vegetables',
    description: 'Organic spinach leaves, washed and ready to cook.',
    nutritionalValues: { calories: '23kcal', protein: '2.9g', carbs: '3.6g', fat: '0.4g' },
    currentStockQuantity: 100,
    lowStockThreshold: 20,
    isPopular: false
  },
  {
    id: '5',
    name: 'Crunchy Carrots',
    pricePerUnit: 60.00,
    unitOfMeasure: 'kg',
    rating: 4.6,
    reviews: 77,
    imageUrl: PlaceHolderImages.find(img => img.id === 'carrots')?.imageUrl || '',
    categoryId: 'vegetables',
    description: 'Sweet and crunchy carrots, packed with Vitamin A.',
    nutritionalValues: { calories: '41kcal', protein: '0.9g', carbs: '10g', fat: '0.2g' },
    currentStockQuantity: 40,
    lowStockThreshold: 10,
    isPopular: true
  }
];
