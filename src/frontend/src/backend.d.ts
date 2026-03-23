import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PaymentSettings {
    instructions: string;
    upiId: string;
}
export type Time = bigint;
export interface Order {
    id: string;
    customerName: string;
    productId: string;
    email: string;
    address: string;
    timestamp: Time;
    quantity: bigint;
    phone: string;
}
export interface Product {
    id: string;
    inStock: boolean;
    name: string;
    description: string;
    category: string;
    priceINR: number;
}
export interface Category {
    id: string;
    name: string;
    emoji: string;
    description: string;
}
export interface backendInterface {
    addProduct(name: string, description: string, priceINR: number, category: string): Promise<string>;
    getAllOrders(adminId: Principal): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getBestSellers(): Promise<Array<Product>>;
    getPaymentSettings(): Promise<PaymentSettings>;
    getProductForCustomer(productId: string): Promise<Product>;
    placeOrder(customerName: string, phone: string, email: string, address: string, productId: string, quantity: bigint): Promise<string>;
    setPaymentSettings(upiId: string, instructions: string): Promise<void>;
    updateProductStock(id: string, inStock: boolean): Promise<void>;
    getCategories(): Promise<Array<Category>>;
    addCategory(name: string, emoji: string, description: string): Promise<string>;
    removeCategory(id: string): Promise<void>;
}
