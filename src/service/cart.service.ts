import { DiscountCollection, Discount } from "./discount.service";
import { FreebiesCollection } from "./freebies.service";
import { type Product, ProductCollection, } from "./product.service"
import EventService, { EVENTS } from "./events.service";


export interface ICartItem { 
    productId: Product['id'],
    quantity: number,
    freeQuantity: number
}

export class CartItem implements ICartItem {
    private _productId: Product['id'];
    private _quantity: number;
    private _freeQuantity: number;

    constructor({ productId, quantity, freeQuantity }: ICartItem) {
        if (freeQuantity > quantity) {
            throw Error(`Free quantity cannot be greater than quantity`)
        }

        if (freeQuantity < 0) {
            throw Error(`Free quantity cannot be negative value`)
        }

        if (quantity < 0) {
            throw Error(`Quantity cannot be negative value`)
        }

        this._productId = productId
        this._freeQuantity = freeQuantity
        this._quantity = quantity
    }

    get productId() {
        return this._productId
    }

    get quantity() {
        return this._quantity
    }

    get freeQuantity() {
        return this._freeQuantity
    }

    set quantity(quantity) {
        if (quantity < 0) {
            throw Error(`Quantity cannot be negative value`)
        }

        this._quantity = quantity
    }

    set freeQuantity(freeQuantity) {
        if (this.quantity < freeQuantity) {
            throw Error(`Free quantity cannot be greater than quantity`)
        }

        if (freeQuantity < 0) {
            throw Error(`Free quantity cannot be negative value`)
        }

        this._freeQuantity = freeQuantity
    }
}

type CartItemActionOption = {
    noEmit?: boolean
    isFree?: boolean
}

interface ICart {
    add(cartItem: Pick<CartItem, 'productId'>, options?: CartItemActionOption): CartItem
    addOrUpdateByRelative(cartItem: Pick<CartItem, 'productId' | 'quantity'>, options: CartItemActionOption): CartItem
    getAll(): CartItem[]
    getById(product: Pick<CartItem, 'productId'>): CartItem
    update(cartItem: Pick<CartItem, 'productId' | 'quantity'>, options?: CartItemActionOption): CartItem
    updateByRelative(cartItem: Pick<CartItem, 'productId' | 'quantity'>, options: CartItemActionOption): CartItem
    remove(product: Pick<CartItem, 'productId'>): boolean
    applyDiscount(discount: Pick<Discount, 'name'>): Discount[]
    removeDiscount(discount: Pick<Discount, 'name'>): Discount[]
    getAppliedDiscount(): Discount[]
    getSubTotalAmount(): number
    getTotalAmount(): number
    getUniqueCounts(): number
    getTotalItemsCount(): number
    isItemExist(cartItem: Pick<CartItem, 'productId'>): boolean
    isEmpty(): boolean
    destory(): void
}

// Singleton to make sure that there is only one cart for the whole app
export default class Cart implements ICart {
    private static instance: Cart
    private items: CartItem[] = []
    private eventService: EventService = EventService.getInstance()
    private productCollection: ProductCollection = ProductCollection.getInstance()
    private discountCollection: DiscountCollection = DiscountCollection.getInstance()
    private freeBiesCollection: FreebiesCollection = FreebiesCollection.getInstance()
    private appliedDiscounts: Discount[] = []
    private prevItems: CartItem[] = []
    // Cart can be created
    private constructor() {
        this.eventService.on(EVENTS.CART_UPDATED, this.onCartUpdated.bind(this))
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new Cart()
        }

        return this.instance
    }

    public add(cartItem: Pick<CartItem, 'productId'>, options?: CartItemActionOption) {
        const item = this.productCollection.getById({
            id: cartItem.productId
        })

        const newCartItem = new CartItem({
            productId: item.id,
            quantity: 1,
            freeQuantity: options?.isFree ? 1 : 0
        })

        this.items.push(newCartItem)

        if (!options?.noEmit) {
            this.eventService.emit(EVENTS.CART_UPDATED, this.items)
        }

        return newCartItem
    }

    public getAll () {
        return this.items;
    }

    public getById(product: Pick<CartItem, 'productId'>): CartItem {
        const item = this.items.find((item) => {
            return item.productId === product.productId
        })

        if (!item) {
            throw Error(`Product:${product.productId} not existed`)
        }

        return item
    }

    // Set to private first as it's only used in cart service
    private addWithQuantity(product: Pick<CartItem, 'productId' | 'quantity'>, options?: CartItemActionOption) {
        const item = this.productCollection.getById({
            id: product.productId
        })
        const newCartItem = new CartItem({
            productId: item.id,
            quantity: product.quantity,
            freeQuantity: options?.isFree ? product.quantity : 0
        })
        this.items.push(newCartItem)

        if (!options?.noEmit) {
            this.eventService.emit(EVENTS.CART_UPDATED, this.items)
        }
        
        return newCartItem
    }

    public update(cartItem: Pick<CartItem, 'productId' | 'quantity'>, options?: CartItemActionOption) {
        const existedItemIndex = this.items.findIndex((item) => {
            return item.productId === cartItem.productId
        })

        if (existedItemIndex < 0) {
           throw new Error(`Product:${cartItem.productId} not existed. Add product first`)
        } else {
            this.items[existedItemIndex] = new CartItem({
                productId: cartItem.productId,
                quantity: cartItem.quantity,
                freeQuantity: options?.isFree ? cartItem.quantity : 0
            })
        }

        if (!options?.noEmit) {
            this.eventService.emit(EVENTS.CART_UPDATED, this.items)
        }

        return this.items[existedItemIndex]
    }

    // Set to private first as it's only used in cart service
    public updateByRelative(cartItem: Pick<CartItem, 'productId' | 'quantity'>, options: CartItemActionOption) {
        const existedItemIndex = this.items.findIndex((item) => {
            return item.productId === cartItem.productId
        })

        if (existedItemIndex < 0) {
            throw new Error(`Product:${cartItem.productId} not existed. Add product first`)
        } else {
            let updatedQuantity = this.items[existedItemIndex].quantity + cartItem.quantity
            let updatedFreeQuantity = options.isFree ? this.items[existedItemIndex].freeQuantity + cartItem.quantity : this.items[existedItemIndex].freeQuantity

            this.items[existedItemIndex] = new CartItem({
                productId: cartItem.productId,
                quantity: updatedQuantity,
                freeQuantity: updatedFreeQuantity
            })
        }

        if (!options.noEmit) {
            this.eventService.emit(EVENTS.CART_UPDATED, this.items)
        }

        return this.items[existedItemIndex]
    }

    public addOrUpdateByRelative(cartItem: Pick<CartItem, 'productId' | 'quantity'>, options: CartItemActionOption) {
       try {
            return this.updateByRelative(cartItem, options)
       } catch (error) {
            return this.addWithQuantity(cartItem, options)
       }
    }

    private onCartUpdated() {
        // Handle freebies changes when items are updated
        this.items.map(item => {
            const freeItems = this.freeBiesCollection.getAllByBuyX({ id: item.productId })

            if (!freeItems.length) return item


            const freeItemsSummary: Record<string, number> = {}

            freeItems.map(freeItem => { 
                if (freeItem.once) {
                    const shouldGiveFreeItem = item.quantity >= freeItem.buyXQuantity

                    if (!shouldGiveFreeItem) {
                        // check if freebie is already given
                        const freeItemGiven = this.items.find(i => i.productId === freeItem.getY.id)

                        if (freeItemGiven) {
                            freeItemsSummary[freeItem.getY.id] = freeItemGiven.freeQuantity - freeItem.getYQuantity
                        }

                        return
                    }

                    if (freeItem.getY.id in freeItemsSummary) {
                        freeItemsSummary[freeItem.getY.id] += freeItem.getYQuantity
                    } else {
                        freeItemsSummary[freeItem.getY.id] = freeItem.getYQuantity
                    }

                    return
                }

               let freeItemQuantity = Math.floor((item.quantity - item.freeQuantity) / freeItem.buyXQuantity) * (freeItem.getYQuantity)
               
                if (freeItem.getY.id in freeItemsSummary) {
                    freeItemsSummary[freeItem.getY.id] += freeItemQuantity
                } else {
                    freeItemsSummary[freeItem.getY.id] = freeItemQuantity
                } 
            })

            

            Object.keys(freeItemsSummary).map(each => {
                const productId = Number(each)
         
                let currentFreeItemQuantity = 0

                try {
                    currentFreeItemQuantity = this.getById({ productId })?.freeQuantity
                } catch (error) {
                    currentFreeItemQuantity = 0
                }

                const freeItemQuantity = freeItemsSummary[each]

                const freeItemQuantityToAdd = freeItemQuantity - currentFreeItemQuantity
                this.addOrUpdateByRelative({
                    productId: productId,
                    quantity: freeItemQuantityToAdd
                }, { isFree: true, noEmit: true })
            }) 
        })

        // Check if there any product that have zero quantity and remove it
        this.items = this.items.filter(item => item.quantity > 0)
 
        // Handle freebies removal when items are removed
        if (this.prevItems.length) {
            const prevItemsID = this.prevItems.map(item => item.productId)
            const currentItemsID = this.items.map(item => item.productId)

            prevItemsID.forEach(id => {
                if (!currentItemsID.includes(id)) {
                    const freeItems = this.freeBiesCollection.getAllByBuyX({ id: id })

                    freeItems.map(freeItem => {
                        this.addOrUpdateByRelative({
                            productId: freeItem.getY.id,
                            quantity: -freeItem.getYQuantity
                        }, { isFree: true, noEmit: true })
                    })    
                }
            })
        }

        this.prevItems = [ ...this.items ]
    }

    // Product can be remove from cart via product id
    public remove(product: Pick<CartItem, 'productId'>) {
        const index = this.items.findIndex((item) => {
            return item.productId === product.productId
        })

        if (index < 0) {
            throw Error(`Removing Product:${product.productId} not existed`)
        }

        this.items.splice(index, 1)

        this.eventService.emit(EVENTS.CART_UPDATED, this.items)

        return true
     } 
    // Can list
    //  all items in cart

    public applyDiscount(discount: Pick<Discount, 'name'>){
        this.appliedDiscounts.push(this.discountCollection.get(discount))
        return this.appliedDiscounts
    }

    public removeDiscount(discount: Pick<Discount, 'name'>) {
        this.appliedDiscounts = this.appliedDiscounts.filter(d => d.name !== discount.name)
        return this.appliedDiscounts
    }

    public getAppliedDiscount() {
        return this.appliedDiscounts
    }

    public getSubTotalAmount()  {
        const subTotal = this.items.reduce((prev, cur) => {
            const product = this.productCollection.getById({ id: cur.productId })
            const actualQuantity = cur.freeQuantity ? cur.quantity - cur.freeQuantity : cur.quantity
            return prev + (actualQuantity * product.price)
        }, 0)

        return subTotal
    }

    public getTotalAmount() {
        let totalAmount = this.getSubTotalAmount() 

        if (this.appliedDiscounts.length) {
           this.appliedDiscounts.map(discount => {
                if (discount.isFixed()) {
                    totalAmount -= discount.amount
                } else if (discount.isPercentage()) {
                    const discountedAmount = (totalAmount * discount.amount) / 100

                    if (discount.maxAmount) {
                        totalAmount -= Math.min(discountedAmount, discount.maxAmount)
                    } 
                    else {
                        totalAmount -= discountedAmount
                    }  
                }
           })
        } 

        if (totalAmount < 0) {
            return 0
        }

        return totalAmount
    }

    // Can count number of unique items in cart
    public getUniqueCounts () {
        return new Set(this.items).size
    }
    
    public getTotalItemsCount() {
        return this.items.reduce((prev, cur) => {
            return prev + cur.quantity
        }, 0)
    }

    // Can check if product already exists
     public isItemExist(cartItem: Pick<CartItem, 'productId'>) {
        return this.items.findIndex((item) => {
            return item.productId === cartItem.productId
        }) > -1
    }

    // Can check if cart is empty
    public isEmpty() {
        return !this.items.length
    }

    // Cart can be destroy 
    public destory() {
        // Assuming "Cart can be destroyed" means removing all items
        this.items = [];
        this.appliedDiscounts = []
        this.prevItems = []
    }
}