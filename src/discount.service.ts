import Status from "./status";

type FixedDiscountType = 'fixed'
type PercentageDiscountType = 'percentage'
 
type DiscountType = FixedDiscountType | PercentageDiscountType

interface IBaseDiscount {
    name: string;
    type: DiscountType;
}

interface IFixedDiscount extends IBaseDiscount {
    type: 'fixed';
    amount: number; // only for fixed type
}

interface IPercentageDiscount extends IBaseDiscount {
    type: 'percentage';
    amount: number; // the percentage of the discount
    maxAmount?: number; // max amount is the cap for the percentage
}


export type IDiscount = IFixedDiscount | IPercentageDiscount ;

export const isFixedDiscount = (discount: Discount): discount is IFixedDiscount => {
    return discount.type === 'fixed'
}

export const isPercentageDiscount = (discount: Discount): discount is IPercentageDiscount => {
    return discount.type === 'percentage'
}

/**
 * @param maxAmount 
 * If the discount type is fixed, the max amount is equal to amount 
 * If the discount type is percentage, the max amount is the provided value
 */
export class Discount {
    name: string;
    type: DiscountType;
    amount?: number;
    maxAmount?: number;

    constructor(discount: IDiscount) {
        this.name = discount.name
        this.type = discount.type

        switch (discount.type) {
            case 'percentage':
                if (discount.amount < 0 || discount.amount > 100) {
                    throw new Status({ 
                        type: 'error', 
                        message: `Discount Type: Percentage must be within 1 and 100`
                    })
                }
                this.amount = discount.amount
                this.maxAmount = discount.maxAmount
                break
            case 'fixed':
                if (discount.amount < 0) {
                    throw new Status({ 
                        type: 'error', 
                        message: `Discount Type: Fixed can't be lower than 0`
                    })
                }
                this.amount = discount.amount
                this.maxAmount = discount.amount
                break
            default:
                break
        }

    }
}

let instance: DiscountCollection;

// Singleton to make sure that there is only discount collection
export default class DiscountCollection {
    collection: Discount[] = []
    
    constructor() {
        if (instance) return instance

        instance = this
    }

    add(discount: Discount) {
        this.collection.push(discount)

        return {
            collection: this.collection, 
            status: new Status({
                type: 'success', 
                message: `Successfully added Discount:${discount.name}`
            })
        }
    }

     addBulk(discounts: Discount[]) {
        this.collection = [...this.collection, ...discounts]

        return {
            collection: this.collection,
            status: new Status({
                type: 'success', 
                message: `Successfully added Discounts`
            })
        }
    }

    remove(discount: Pick<Discount, 'name'>) {
        const index = this.collection.findIndex(item => {
            return item.name = discount.name
        })

        if (index < 0) {
            throw new Status({
                type: 'error', 
                message: `Discount:${name} not existed`
            })
        }

        this.collection.splice(index, 1)
        
        return new Status({
            type: 'success', 
            message: `Successfully added Discount:${name}`
        })
    }

    get(discount: Pick<Discount, 'name'>) {
        return this.collection.find(item => {
            return item.name === discount.name
        })
    }
}