import { Customers } from "@models/sales";
export interface CustomerService{
    afterRead(CustomerList: Customers): Customers;
}
