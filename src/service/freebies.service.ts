import { type Product, ProductCollection } from "./product.service";


export interface IBuyXGetY {
    id: number
    buyX: Pick<Product, 'id'>
    getY: Pick<Product, 'id'>
    buyXQuantity: number
    getYQuantity: number
    once: boolean
}

export class BuyXGetY implements IBuyXGetY {
    private _id: number
    private _buyX: Pick<Product, 'id'>
    private _getY: Pick<Product, 'id'>
    private _buyXQuantity: number
    private _getYQuantity: number
    private _once: boolean

    constructor({ id, buyX, getY, buyXQuantity = 1, getYQuantity = 1, once = false }: IBuyXGetY) {
        this._id = id;
        this._buyX = buyX; 
        this._getY = getY;
        this._buyXQuantity = buyXQuantity;
        this._getYQuantity = getYQuantity;
        this._once = once;
    }

    get id() {
        return this._id
    }

    get buyX() {
        return this._buyX
    }

    set buyX(buyX: Pick<Product, 'id'>) {
        this._buyX = buyX
    }

    get getY() {
        return this._getY
    }

    set getY(getY: Pick<Product, 'id'>) {
        this._getY = getY
    }

    get buyXQuantity() {
        return this._buyXQuantity
    }

    set buyXQuantity(buyXQuantity: number) {
        if (buyXQuantity < 0) {
            throw Error("BuyXQuantity cannot be negative value")
        }
        this._buyXQuantity = buyXQuantity
    }

    get getYQuantity() {
        return this._getYQuantity
    }

    set getYQuantity(getYQuantity: number) {
        if (getYQuantity < 0) {
            throw Error("GetYQuantity cannot be negative value")
        }
        this._getYQuantity = getYQuantity
    }

    get once() {
        return this._once  
    }

    set once(once: boolean) {
        this._once = once
    }
}

interface IFreebiesCollection { 
    add(buyXGetY: IBuyXGetY): BuyXGetY
    remove(buyXGetY: Pick<IBuyXGetY, 'id'>): boolean
    getAllByBuyX(buyX: Pick<IBuyXGetY['buyX'], 'id'>): BuyXGetY[]
    getById(buyXgetY: Pick<IBuyXGetY, 'id'>): BuyXGetY
    destory(): void
}

export class FreebiesCollection implements IFreebiesCollection {
    private collection: BuyXGetY[] = []
    private productCollection = ProductCollection.getInstance()
    private static instance: FreebiesCollection

    private constructor() {}

    public static getInstance() {
        if (!this.instance) {
            this.instance = new FreebiesCollection()
        }

        return this.instance
    }

    public add(buyXGetY: IBuyXGetY) {
        const buyX = this.productCollection.getById({ id: buyXGetY.buyX.id })
        const getY = this.productCollection.getById({ id: buyXGetY.getY.id })

        const newBuyXGetY = new BuyXGetY({
            ...buyXGetY,
            buyX: { id: buyX.id },
            getY: { id: getY.id },
        })

        this.collection.push(newBuyXGetY)

        return newBuyXGetY

    }

    public remove(buyXGetY: Pick<IBuyXGetY, 'id'>) {
        const index = this.collection.findIndex((item) => {
            return item.id === buyXGetY.id
        })
    
        if (index < 0) {
            throw Error(`Removing BuyXGetY:${buyXGetY.id} not existed`)
        }
    
        this.collection.splice(index, 1)
        
        return true
    }

    public getAllByBuyX(buyX: Pick<Product, 'id'>) {
        return this.collection.filter((item) => {
            return item.buyX.id === buyX.id
        })
    }

    public getById(buyXgetY: Pick<IBuyXGetY, 'id'>) {
        const item = this.collection.find((item => {
            return item.id === buyXgetY.id
        }))

        if (!item) {
            throw Error("Freebie not existed")
        }

        return item
    }

    public destory() {
        this.collection = []
    }
}