//import { Customer, Customers } from '@cds-models/sales';
import { Customer, Customers } from '@models/sales';

const cust: Customer = {
    email : "ortiz.filho@castgroup.com.br",
    lastName : "filho",
    firstName : 'Ortiz',
    id: '123456'
};

const customers: Customers = [ cust];

const funcao = (variavel: string) => console.log(variavel);

funcao('123');

