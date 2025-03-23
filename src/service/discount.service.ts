type FixedDiscountType = 'fixed'
type PercentageDiscountType = 'percentage'
 
type DiscountType = FixedDiscountType | PercentageDiscountType

interface IBaseDiscount {
    id: number;
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

export type IDiscountWithoutId = Omit<IFixedDiscount, 'id'> | Omit<IPercentageDiscount, 'id'>;

/**
 * @param maxAmount 
 * If the discount type is fixed, the max amount is equal to amount 
 * If the discount type is percentage, the max amount is the provided value
 */
export class Discount implements IBaseDiscount {
    private _id: number;
    private _name: string;
    private _type: DiscountType;
    private _amount?: number;
    private _maxAmount?: number;

    constructor(discount: IDiscount) {
        this._id = discount.id
        this._name = discount.name
        this._type = discount.type

        switch (discount.type) {
            case 'percentage':
                if (discount.amount < 0 || discount.amount > 100) {
                    throw Error(`Discount Type: Percentage must be within 1 and 100`)
                }
                this._amount = discount.amount
                this._maxAmount = discount.maxAmount
                break
            case 'fixed':
                if (discount.amount < 0) {
                    throw Error(`Discount Type: Fixed can't be lower than 0`)
                }
                this._amount = discount.amount
                this._maxAmount = discount.amount
                break
            default:
                break
        }
    }

    get id() {
        return this._id
    }

    get name() {
        return this._name
    }

    get type() {
        return this._type
    }

    get amount(): number | undefined {
        return this._amount
    }

    set amount(amount: number) {
        if (this.isFixed()) {
            this._amount = amount
            this._maxAmount = amount
        }
        if (this.isPercentage()) {
            this._amount = amount
        }
    }   

    get maxAmount(): number | undefined {
        return this._maxAmount
    }

    set maxAmount(maxAmount: number) {
        if (this.isFixed()) {
            this._maxAmount = undefined
        }
        if (this.isPercentage()) {
            this._maxAmount = maxAmount
        }
    }

    isFixed(): this is IFixedDiscount {
        return this._type === 'fixed'
    }

    isPercentage(): this is IPercentageDiscount {
        return this._type === 'percentage'
    }
}

interface IDiscountCollection {
    add(discount: IDiscount): Discount
    addBulk(discounts: IDiscount[]): Discount[]
    remove(discount: Pick<Discount, 'name'>): boolean   
    get(discount: Pick<Discount, 'name'>): Discount
    getAll(): Discount[]
    destory(): void
}

// Singleton to make sure that there is only discount collection
export class DiscountCollection implements IDiscountCollection {
    private static instance: DiscountCollection
    private collection: Discount[] = []
    private lastIndex = 0
    private constructor() {}

    public static getInstance() {
        if (!this.instance) {
            this.instance = new DiscountCollection()
        }

        return this.instance
    }

    private Id() {
        this.lastIndex++
        return this.lastIndex
    }

    public add(discount: IDiscountWithoutId) {
        const newDiscount = new Discount({...discount, id: this.Id()})
        this.collection.push(newDiscount)

        return newDiscount
    }

    public addBulk(discounts: IDiscountWithoutId[]) {
        const newDiscounts = discounts.map(each => {
            return new Discount({...each, id: this.Id()})
        })
        this.collection = [...this.collection, ...newDiscounts]

        return newDiscounts
    }

    public remove(discount: Pick<Discount, 'name'>) {
        const index = this.collection.findIndex(item => {
            return item.name === discount.name
        })

        if (index < 0) {
            throw Error(`Discount:${discount.name} not existed`)
        }

        this.collection.splice(index, 1)
        
        return true
    }

    public get(discount: Pick<Discount, 'name'>) {
        const item = this.collection.find(item => {
            return item.name === discount.name
        })

        if (!item) {
            throw Error("This Discount doesn't exist")
        }

        return item 
    }

    public getAll() {
        return this.collection
    }

    public destory() {
        this.collection = []
        this.lastIndex = 0  
    }
}