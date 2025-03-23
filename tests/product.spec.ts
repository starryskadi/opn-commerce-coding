import { Product, ProductCollection } from "../src/service/product.service" 

describe("Product", () => {
    const productCollection = ProductCollection.getInstance()

    it("Product can be created", () => {
        const product = new Product({
            id: 1,
            name: 'Product 1',
            price: 50
        })

        productCollection.add(product)

        expect(productCollection.getById(product).id).toBe(1)
    })

    it("Multiple products can be created", () => {
        productCollection.addBulk([
            {
                name: 'Product 1',  
                price: 50
            }, 
            {
                name: 'Product 2',
                price: 150
            }, 
            {
                name: 'Product 3',
                price: 250
            }, 
        ])

        expect(productCollection.getAll().length).toBe(3)

        
    });

    it("Get a product by id", () => {
        productCollection.addBulk([
            {
                name: 'Product 1',
                price: 50
            }, 
            {
                name: 'Product 2',
                price: 150
            }, 
            {
                name: 'Product 3',
                price: 250
            }, 
        ])

        const product = productCollection.getById({ id: 1 })

        expect(product.id).toBe(1)
    })

    it("Can remove a product", () => {
        productCollection.addBulk([
            {
                name: 'Product 1',
                price: 50
            }, 
            {
                name: 'Product 2',
                price: 150
            }, 
            {
                name: 'Product 3',
                price: 250
            }, 
        ])

        productCollection.remove({ id: 1 })

        expect(productCollection.getAll().length).toBe(2)
    })

    afterEach(() => {
        productCollection.destory()
    })
});

