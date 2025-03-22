import { Product } from "./product.service";
import Status from "./status";

class BuyXGetY {
    id: number
    buyX: Product
    getY: Product

    constructor({ id, buyX, getY }: BuyXGetY) {
        this.id = id;
        this.buyX = buyX; 
        this.getY = getY;
    }
}

let instance: FreebiesCollection

export class FreebiesCollection {
    private collection: BuyXGetY[] = []

    constructor() {
        if (instance) return instance;

        instance = this
    }

    add(buyXGetY: BuyXGetY) {
        this.collection.push(buyXGetY)
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
}