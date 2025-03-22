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
    private collection: Product[] = []

    constructor() {
        if (instance) return instance

        instance = this
    }

    add(product: Product) {
        const newProduct = new Product(product)
        this.collection.push(newProduct)

        return {
            collection: this.collection,
            status: new Status({
                type: 'success', 
                message: `Successfully added Product:${product.id}`
            })
        }
    }

    addBulk(products: Product[]) {
        const newProducts = products.map(product => {
            return new Product(product)
        })
        this.collection = [...this.collection, ...newProducts]

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
            throw Error(`Removing Discount:${product.id} not existed`)
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
            throw Error("This product doesn't exist")
        }

        return item 
    }

    getAll() {
        return this.collection
    }

    destory() {
        this.collection = []
    }
}