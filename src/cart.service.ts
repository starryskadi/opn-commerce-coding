import DiscountCollection, { Discount, isFixedDiscount, isPercentageDiscount } from "./discount.service";
import { Freebies } from "./freebies.service";
import { ProductCollection, type Product } from "./product.service"
import Status from "./status";

let instance: Cart; 

type CartItem = Product & { quantity: number }

// Singleton to make sure that there is only one cart for the whole app
export default class Cart {
    items: CartItem[] = []
    productCollection: ProductCollection = new ProductCollection()
    discountCollection: DiscountCollection = new DiscountCollection()
    freeBiesCollection: Freebies = new Freebies()
    appliedDiscount: Discount | undefined

    // Cart can be created
    constructor() {
        if (instance) return instance

        instance = this
    }

    // Cart can be destroy 
    destory() {
        // Assuming "Cart can be destroyed" means removing all items
        this.items = [];

        // Assuming "Cart can be destroyed" means destroying the entire cart, 
        // but in most ecommerce case, it usually means delete the items
        // instance = null;
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

    // Cart can be updated via product id. This update must be an absolute update
    addOrUpdate(product: Pick<CartItem, 'id' | 'quantity'>, isAddingFreeItem: boolean = false) {
        const updatedItem = this.productCollection.getById(product)
        const freeItems = this.freeBiesCollection.getAllByBuyX(product)  

        const existedItemIndex = this.items.findIndex((item) => {
            return item.id === updatedItem.id
        })

        if (existedItemIndex > 0) {
            this.items[existedItemIndex] = {
                ...this.items[existedItemIndex],
                quantity: product.quantity
            }
        } else {
            this.items.push({
                ...updatedItem,
                quantity: product.quantity
            })
        }

        if (freeItems.length && !isAddingFreeItem) {
            // Added 'isAddingFreeItem' to stop recursive if buyXgetY is adding the same item
            freeItems.map(freeItem => {
                this.addOrUpdate({
                    ...freeItem.getY,
                    quantity: 1
                }, true)
            })
        }
    }

    // Product can be remove from cart via product id
    remove(product: Pick<Product, 'id'>) {
        const index = this.items.findIndex((item) => {
            return item.id === product.id
        })

        if (index < 0) {
            throw new Status({
                type: 'error', 
                message: `Removing Product:${product.id} not existed`
            })
        }

        this.items.splice(index, 1)
        
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

    // Can count number of unique items in cart
    getUniqueCounts () {
        return new Set(this.items).size
    }
    
    getSubTotalAmount()  {
        return this.items.reduce((prev, cur) => {
            return prev + (cur.quantity * cur.price)
        }, 0)
    }

    getTotalItemsCount() {
        return this.items.reduce((prev, cur) => {
            return prev + cur.quantity
        }, 0)
    }

    applyDiscount(discount: Pick<Discount, 'name'>){
        this.appliedDiscount = this.discountCollection.get(discount)
    }

    getTotalAmount() {
        let totalAmount = this.getSubTotalAmount() 

        if (this.appliedDiscount) {
           if (isFixedDiscount(this.appliedDiscount)) {
                totalAmount -= this.appliedDiscount.amount
           } else if (isPercentageDiscount(this.appliedDiscount)) {
                const discountedAmount = (totalAmount * this.appliedDiscount.amount) / 100

                if (this.appliedDiscount.maxAmount) {
                    totalAmount -= Math.min(discountedAmount, this.appliedDiscount.maxAmount)
                } 
                else {
                    totalAmount -= discountedAmount
                }  
           }               
        } 

        if (totalAmount < 0) {
            return 0
        }

        return totalAmount
    }
}