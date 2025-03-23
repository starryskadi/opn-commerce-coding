import { type Product, ProductCollection } from "./product.service";
import Status from "../status";
import EventService from "./events.service";

export class BuyXGetY {
    id: number
    buyX: Pick<Product, 'id'>
    getY: Pick<Product, 'id'>
    buyXQuantity: number
    getYQuantity: number
    once: boolean

    constructor({ id, buyX, getY, buyXQuantity = 1, getYQuantity = 1, once = false }: BuyXGetY) {
        this.id = id;
        this.buyX = buyX; 
        this.getY = getY;
        this.buyXQuantity = buyXQuantity;
        this.getYQuantity = getYQuantity;
        this.once = once;
    }
}

let instance: FreebiesCollection

export class FreebiesCollection {
    private collection: BuyXGetY[] = []
    private productCollection = new ProductCollection()

    constructor() {
       
        if (instance) return instance;

        instance = this
    }

    add(buyXGetY: BuyXGetY) {
        const buyX = this.productCollection.getById({ id: buyXGetY.buyX.id })
        const getY = this.productCollection.getById({ id: buyXGetY.getY.id })

        this.collection.push({
            ...buyXGetY,
            buyX,
            getY,
        })
    }

    remove(buyXGetY: Pick<BuyXGetY, 'id'>) {
        const index = this.collection.findIndex((item) => {
            return item.id === buyXGetY.id
        })
    
        if (index < 0) {
            throw Error(`Removing BuyXGetY:${buyXGetY.id} not existed`)
        }
    
        this.collection.splice(index, 1)
        
        return new Status({
            type: 'success', 
            message: `Successfully removed Discount:${buyXGetY.id}`
        })
    }

    getAllByBuyX(buyX: Pick<Product, 'id'>) {
        return this.collection.filter((item) => {
            return item.buyX.id === buyX.id
        })
    }

    getById(buyXgetY: Pick<BuyXGetY, 'id'>) {
        const item = this.collection.find((item => {
            return item.id === buyXgetY.id
        }))

        if (!item) {
            throw Error("Freebie not existed")
        }

        return item
    }

    destory() {
        this.collection = []
    }
}