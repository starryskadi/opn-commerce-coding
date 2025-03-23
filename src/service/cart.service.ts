import { DiscountCollection, Discount, isFixedDiscount, isPercentageDiscount } from "./discount.service";
import { BuyXGetY, FreebiesCollection } from "./freebies.service";
import { ProductCollection, type Product } from "./product.service"
import Status from "../status";
import EventService, { EVENTS } from "./events.service";
let instance: Cart; 

export type CartItem = Product & { quantity: number, freeQuantity: number }

type CartItemActionOption = {
    noEmit?: boolean
    isFree?: boolean
}

// Singleton to make sure that there is only one cart for the whole app
export default class Cart {
    private items: CartItem[] = []
    private eventService: EventService = new EventService()
    private productCollection: ProductCollection = new ProductCollection()
    private discountCollection: DiscountCollection = new DiscountCollection()
    private freeBiesCollection: FreebiesCollection = new FreebiesCollection()
    private appliedDiscounts: Discount[] = []
    private prevItems: CartItem[] = []

    // Cart can be created
    constructor() {
        this.eventService.on(EVENTS.CART_UPDATED, this.onCartUpdated.bind(this))

        if (instance) return instance

        instance = this
    }

    // Cart can be destroy 
    destory() {
        // Assuming "Cart can be destroyed" means removing all items
        this.items = [];
        this.appliedDiscounts = []
        this.prevItems = []
    }

    // Can check if product already exists
    isItemExist(product: Pick<Product, 'id'>) {
        return this.items.findIndex((item) => {
            return item.id === product.id
        }) > -1
    }

    // Can check if cart is empty
    isEmpty() {
        return !this.items.length
    }

    add(product: Pick<CartItem, 'id'>, options?: CartItemActionOption) {
        const item = this.productCollection.getById(product)
        this.items.push({
            ...item,
            quantity: 1,
            freeQuantity: options?.isFree ? 1 : 0
        })

        if (!options?.noEmit) {
            this.eventService.emit(EVENTS.CART_UPDATED, this.items)
        }
    }

    addWithQuantity(product: Pick<CartItem, 'id' | 'quantity'>, options?: CartItemActionOption) {
        const item = this.productCollection.getById(product)
        this.items.push({
            ...item,
            quantity: product.quantity,
            freeQuantity: options?.isFree ? product.quantity : 0
        })

        if (!options?.noEmit) {
            this.eventService.emit(EVENTS.CART_UPDATED, this.items)
        }
    }

    update(product: Pick<CartItem, 'id' | 'quantity'>, options?: CartItemActionOption) {
        if (product.quantity < 0) {
            throw new Error(`Product:${product.id} quantity cannot be negative`)
        }

        const existedItemIndex = this.items.findIndex((item) => {
            return item.id === product.id
        })

        if (existedItemIndex < 0) {
           throw new Error(`Product:${product.id} not existed. Add product first`)
        } else {
            this.items[existedItemIndex] = {
                ...this.items[existedItemIndex],
                quantity: product.quantity,
                freeQuantity: options?.isFree ? product.quantity : 0
            }
        }

        if (!options?.noEmit) {
            this.eventService.emit(EVENTS.CART_UPDATED, this.items)
        }
    }

    updateByRelative(product: Pick<CartItem, 'id' | 'quantity'>, options: CartItemActionOption) {
        const existedItemIndex = this.items.findIndex((item) => {
            return item.id === product.id
        })

        if (existedItemIndex < 0) {
            throw new Error(`Product:${product.id} not existed. Add product first`)
        } else {
            let updatedQuantity = this.items[existedItemIndex].quantity + product.quantity
            let updatedFreeQuantity = options.isFree ? this.items[existedItemIndex].freeQuantity + product.quantity : this.items[existedItemIndex].freeQuantity

            if (updatedQuantity < 0) {
                throw new Error(`Product:${product.id} quantity cannot be negative`)
            }

            this.items[existedItemIndex] = {
                ...this.items[existedItemIndex],
                quantity: updatedQuantity,
                freeQuantity: updatedFreeQuantity
            }
        }

        if (!options.noEmit) {
            this.eventService.emit(EVENTS.CART_UPDATED, this.items)
        }
    }

    addOrUpdateByRelative(product: Pick<CartItem, 'id' | 'quantity'>, options: CartItemActionOption) {
       try {
            this.updateByRelative(product, options)
       } catch (error) {
            this.addWithQuantity(product, options)
       }
    }

    onCartUpdated() {
        // Handle freebies changes when items are updated
        this.items.map(item => {
            const freeItems = this.freeBiesCollection.getAllByBuyX({ id: item.id })

            if (!freeItems.length) return item


            const freeItemsSummary: Record<string, number> = {}

            freeItems.map(freeItem => { 
                if (freeItem.once) {
                    const shouldGiveFreeItem = item.quantity >= freeItem.buyXQuantity

                    if (!shouldGiveFreeItem) {
                        // check if freebie is already given
                        const freeItemGiven = this.items.find(i => i.id === freeItem.getY.id)

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
                const id = Number(each)
                const currentFreeItemQuantity = this.getById({ id: id })?.freeQuantity || 0
                const freeItemQuantity = freeItemsSummary[each]

                const freeItemQuantityToAdd = freeItemQuantity - currentFreeItemQuantity
                this.addOrUpdateByRelative({
                    id: id,
                    quantity: freeItemQuantityToAdd
                }, { isFree: true, noEmit: true })
            }) 
        })

        // Check if there any product that have zero quantity and remove it
        this.items = this.items.filter(item => item.quantity > 0)
 
        // Handle freebies removal when items are removed
        if (this.prevItems.length) {
            const prevItemsID = this.prevItems.map(item => item.id)
            const currentItemsID = this.items.map(item => item.id)

            prevItemsID.forEach(id => {
                if (!currentItemsID.includes(id)) {
                    const freeItems = this.freeBiesCollection.getAllByBuyX({ id: id })

                    freeItems.map(freeItem => {
                        this.addOrUpdateByRelative({
                            id: freeItem.getY.id,
                            quantity: -freeItem.getYQuantity
                        }, { isFree: true, noEmit: true })
                    })    
                }
            })
        }

        this.prevItems = [ ...this.items ]
    }

    // Product can be remove from cart via product id
    remove(product: Pick<Product, 'id'>) {
        const index = this.items.findIndex((item) => {
            return item.id === product.id
        })

        if (index < 0) {
            throw Error(`Removing Product:${product.id} not existed`)
        }

        this.items.splice(index, 1)

        this.eventService.emit(EVENTS.CART_UPDATED, this.items)

        return new Status({
            type: 'success', 
            message: `Successfully removed Product:${product.id}`
        })
     } 
    // Can list
    //  all items in cart
    getAll () {
        return this.items;
    }

    getById(product: Pick<Product, 'id'>) {
        return this.items.find((item) => {
            return item.id === product.id
        })
    }

    // Can count number of unique items in cart
    getUniqueCounts () {
        return new Set(this.items).size
    }
    
    getSubTotalAmount()  {
        const subTotal = this.items.reduce((prev, cur) => {
            const actualQuantity = cur.freeQuantity ? cur.quantity - cur.freeQuantity : cur.quantity
            return prev + (actualQuantity * cur.price)
        }, 0)

        return subTotal
    }

    getTotalItemsCount() {
        return this.items.reduce((prev, cur) => {
            return prev + cur.quantity
        }, 0)
    }

    applyDiscount(discount: Pick<Discount, 'name'>){
        this.appliedDiscounts.push(this.discountCollection.get(discount))
    }

    removeDiscount(discount: Pick<Discount, 'name'>) {
        this.appliedDiscounts = this.appliedDiscounts.filter(d => d.name !== discount.name)
    }

    getAppliedDiscount() {
        return this.appliedDiscounts
    }

    getTotalAmount() {
        let totalAmount = this.getSubTotalAmount() 

        if (this.appliedDiscounts.length) {
           this.appliedDiscounts.map(discount => {
                if (isFixedDiscount(discount)) {
                    totalAmount -= discount.amount
                } else if (isPercentageDiscount(discount)) {
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
}