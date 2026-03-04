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

import cds, { Request, Service } from '@sap/cds';
import { Customers, Product, Products, SalesOrderHeaders, SalesOrderItem, SalesOrderItems } from '@models/sales';
import { create } from 'axios';
export default(service: Service ) =>{
  
  service.before('READ','*',(request: Request) =>{
    if (!request.user.is('read_only_user')){
      return request.reject(403, 'Não autorizado');
    }    
  });

    service.before(['WRITE','DELETE'],'*',(request: Request) =>{
    if (!request.user.is('admin')){
      return request.reject(403, 'Não autorizado escrita/deleção');
    }    
  });

  service.after('READ', 'Customers', (results:Customers) => {
      console.log(results.at(-1));

      results.forEach(customer =>{
        if (!customer.email?.includes('@')){
            customer.email = `${customer.email}@hotmail.com`
        }
      })
    });

    service.before('CREATE','SalesOrderHeaders', async (request:Request) =>{
        const params = request.data;
        if (!params.customer_id){
            return request.reject(400,'Customer inválido');
        }
        console.log(params);

      if (!params.items || params.items.length === 0){
        return request.reject(400, 'Itens inválidos');
      }  

      const customerQuery = SELECT.one.from('sales.Customers').where({id: params.customer_id});
      const customer = await cds.run(customerQuery);
      if (!customer){
        return request.reject(404,'Customer não encontrado');
      }

     const productsIds: string[] = params.items.map((item : SalesOrderItem) => item.product_id);
     const productsQuery = SELECT.from('sales.Products').where({id: productsIds});
     const products : Products = await cds.run(productsQuery);
     const dbProducts = products.map((product) => product.id);

     for(const item of params.items){
          const dbProduct = products.find(product => product.id === item.product_id);
          if (!dbProduct){
               return request.reject(404, `Produto ${item.product_id} não encontrado`);
          }
          if (dbProduct.stock === 0){
            return request.reject(400,`Produto ${dbProduct.name} sem estoque`);

          }
     }

    let totalAmount = 0;
    params.items.forEach(item => {
      totalAmount += (item.price as number) * (item.quantity as number);
    });
    
    console.log(`Antes do desconto: ${totalAmount}`);
    if (totalAmount > 200) {
      const discount = totalAmount  * (10/100);
      totalAmount  = totalAmount - discount;
    }
    console.log(`Depois do desconto ${totalAmount}`);


     request.data.totalAmount = totalAmount;

    });



    service.after('CREATE', 'SalesOrderHeaders', async (results: SalesOrderHeaders) => {
       const headerAsArray = Array.isArray(results) ? results : [results] as SalesOrderHeaders;
       for (const header of headerAsArray){
        const items = header.items as SalesOrderItems;
        const productsData = items.map(item => ({
            id: item.product_id as string,
            quantity: item.quantity as number
        }));

        const products_Ids: String[] = productsData.map((productData) => productData.id);
        const productsQuery = SELECT.from('sales.Products').where({id: products_Ids});
        const products: Products = await cds.run(productsQuery);

        for(const productData of productsData){
            const foundProduct = products.find(product => product.id === productData.id) as Product;
            foundProduct.stock = (foundProduct.stock as number) - productData.quantity;
            await cds.update('sales.Products').where({id: foundProduct.id}).with({stock: foundProduct.stock})
        }

       }
    });
}