export interface Order {
  id: number;
  date: string;
  userId: number;
  products: number[];
  totalAmount: number;
}
