import Status from "./status"

export class Product {
    id: number
    name: string;
    price: number

    constructor({id, name, price}: Product) {
        this.id = id, 
        this.price = price
        this.name = name
    }
}

// Singleton to make sure that there is only one product colletion for the whole app
let instance: ProductCollection 

export class ProductCollection {
    collection: Product[] = []

    constructor() {
        if (instance) return instance

        instance = this
    }

    add(product: Product) {
        this.collection.push(product)

        return {
            collection: this.collection,
            status: new Status({
                type: 'success', 
                message: `Successfully added Product:${product.id}`
            })
        }
    }

    addBulk(products: Product[]) {
        this.collection = [...this.collection, ...products]

        return {
            collection: this.collection,
            status: new Status({
                type: 'success', 
                message: `Successfully added Products`
            })
        }
    }

    remove(product: Pick<Product, 'id'>) {
        const index = this.collection.findIndex((item) => {
            return item.id === product.id
        })

        if (index < 0) {
            throw new Status({
                type: 'error', 
                message: `Removing Discount:${product.id} not existed`
            })
        }

        this.collection.splice(index, 1)
        
        return new Status({
            type: 'success', 
            message: `Successfully removed Discount:${product.id}`
        })
    } 

    getById(product: Pick<Product, 'id'>)  {
        const item = this.collection.find((item) => {
            return item.id === product.id
        })

        if (!item) {
            throw new Status({
                type: 'error', 
                message: "This product doesn't exist"
            }) 
        }

        return item 
    }
}