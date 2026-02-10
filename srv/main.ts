// //import { Customer, Customers } from '@cds-models/sales';
// import { Customer, Customers } from '@models/sales';

// const cust: Customer = {
//     email : "ortiz.filho@castgroup.com.br",
//     lastName : "filho",
//     firstName : 'Ortiz',
//     id: '123456'
// };

// const customers: Customers = [ cust];

// const funcao = (variavel: string) => console.log(variavel);

// funcao('123');

import { Service } from '@sap/cds';
import { Customers } from '@models/sales';
export default(service: Service ) =>{
    service.after('READ', 'Customers', (results:Customers) => {
      console.log(results.at(-1));

      results.forEach(customer =>{
        if (!customer.email?.includes('@')){
            customer.email = `${customer.email}@hotmail.com`
        }
      })
    });
}