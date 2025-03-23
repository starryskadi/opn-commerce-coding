export interface IProduct {
    id: number; 
    name: string;
    price: number
}

export class Product implements IProduct {
    private _id: number
    private _name: string;
    private _price: number

    constructor({id, name, price}: IProduct) {
        this._id = id, 
        this._price = price
        this._name = name
    }

    get id() {
        return this._id
    }

    get name() {
        return this._name
    }

    set name(name: string) {
        this._name = name
    }

    get price() {
        return this._price
    }

    set price(price) {
        if (price < 0) {
            throw new Error("Price cannot be negative value")
        }
        this._price = price
    }
}

interface IProductCollection {
    add(product: IProduct): Product
    addBulk(products: IProduct[]): Product[]
    remove(product: Pick<IProduct, 'id'>): boolean
    getById(product: Pick<IProduct, 'id'>): Product
    getAll(): Product[]
    destory(): void
}

// Singleton to make sure that there is only one product colletion for the whole app

export class ProductCollection implements IProductCollection {
    static instance: ProductCollection
    private collection: Product[] = []

    private constructor() {}

    public static getInstance() {
        if (!this.instance) {
            this.instance = new ProductCollection()
        }

        return this.instance
    }

    public add(product: IProduct) {
        const newProduct = new Product(product)
        this.collection.push(newProduct)

        return newProduct
    }

    public addBulk(products: IProduct[]) {
        const newProducts = products.map(product => {
            return new Product(product)
        })
        this.collection = [...this.collection, ...newProducts]

        return newProducts
    }

    public remove(product: Pick<IProduct, 'id'>) {
        const index = this.collection.findIndex((item) => {
            return item.id === product.id
        })

        if (index < 0) {
            throw Error(`Removing Product:${product.id} not existed`)
        }

        this.collection.splice(index, 1)
        
        return true
    } 

    public getById(product: Pick<IProduct, 'id'>): Product {
        const item = this.collection.find((item) => {
            return item.id === product.id
        })

        if (!item) {
            throw Error("This product doesn't exist")
        }

        return item 
    }

    public getAll() {
        return this.collection
    }

    public destory() {
        this.collection = []
    }
}