import Cart from "../src/cart.service";
import { DiscountCollection } from "../src/discount.service";
import { FreebiesCollection } from "../src/freebies.service";
import { ProductCollection } from "../src/product.service";

describe("Cart", () => {
    const productCollection = new ProductCollection()
    const discountCollection = new DiscountCollection()
    const freebies = new FreebiesCollection()
    const cart = new Cart()

    beforeAll(() => {
        productCollection.addBulk([
            {
                id: 1, 
                name: 'Product 1',
                price: 50
            }, 
            {
                id: 2, 
                name: 'Product 2',
                price: 150
            }, 
            {
                id: 3, 
                name: 'Product 3',
                price: 250
            }, 
        ]) 

        discountCollection.addBulk([
            {
                name: "Discount 1",
                amount: 50,
                type: 'percentage',
            },
            {
                name: "Discount 2",
                amount: 250,
                type: 'fixed',
            },
            {
                name: "Discount 3",
                amount: 500,
                type: 'fixed',
            },
            {
                name: "Discount 4",
                amount: 100,
                type: 'percentage',
                maxAmount: 500
            },
        ])
    })

    it('Product can be added to cart via product id', () => {
        const product = productCollection.getById({ id: 1});
        
        cart.addOrUpdate({
            id: product.id,
            quantity: 1
        })

        expect(cart.getById(product)).toEqual({
            ...product,
            quantity: 1
        })
    })


    // Cart can be updated via product id. This update must be an absolute update
    // i.e. updating product id 1 with quantity of 10 will update the cart product id 1 in cart to quantity of 10
    it('Product can be updated to cart via product id with absolute quantity', () => {
        // Initialize the product
        cart.addOrUpdate({
            id: productCollection.getById({ id: 1 }).id,
            quantity: 1
        })

        const updatedProduct = {
            id: productCollection.getById({ id: 1 }).id, 
            quantity: 10
        }

        cart.addOrUpdate(updatedProduct)

        expect(cart.getById({
            id: 1
        })?.quantity).toBe(10)
    })

    it('Product can be remove from cart via product id', () => {
        cart.addOrUpdate({
            id: productCollection.getById({ id: 1 }).id,
            quantity: 1
        })

        cart.addOrUpdate({
            id: productCollection.getById({ id: 2 }).id,
            quantity: 1
        })

        cart.addOrUpdate({
            id: productCollection.getById({ id: 3 }).id,
            quantity: 1
        })

        cart.remove({
            id: productCollection.getById({ id: 3 }).id
        })

        expect(cart.getAll()).toEqual([
            { ...productCollection.getById({ id: 1 }), quantity: 1},
            { ...productCollection.getById({ id: 2 }), quantity: 1}
        ])
    })

    it('Can check if product already exists (Positive)', () => {
        cart.addOrUpdate({
            id: productCollection.getById({ id: 1}).id,
            quantity: 1
        })

        const isItemExist = cart.isItemExist({
            id: 1
        })

        expect(isItemExist).toBe(true)
    })

    it('Can check if product already exists (Negative)', () => {
        cart.addOrUpdate({
            id: productCollection.getById({ id: 2 }).id,
            quantity: 1
        })

        const isItemExist = cart.isItemExist({
            id: 1
        })

        expect(isItemExist).toBe(false)
    })

    it('Freebies added to cart via product id', () => {
        const addedFreebie = {
            id: 1,
            buyX: productCollection.getById({ id: 1 }),
            getY: productCollection.getById({ id: 2 }),
        }

        freebies.add(addedFreebie)

        cart.addOrUpdate({
            id: productCollection.getById({ id: 1}).id,
            quantity: 1
        })

        expect(cart.getById({
            id: addedFreebie.getY.id
        })).toEqual({ ...addedFreebie.getY, quantity: 1 })
    })

    it('Can list all items in cart', () => {
        const toAddItems = [
            {
                id: productCollection.getById({ id: 1 }).id,
                quantity: 1
            },
            {
                id: productCollection.getById({ id: 2 }).id,
                quantity: 1
            },
            {
                id: productCollection.getById({ id: 3 }).id,
                quantity: 1
            }
        ]

        toAddItems.map(item => {
            cart.addOrUpdate(item)
        })

        expect(cart.getAll().map(each => ({ id: each.id, quantity: each.quantity }))).toEqual(toAddItems)
    })

    it('Can count number of unique items in cart', () => {
        const toAddItems = [
            {
                id: productCollection.getById({ id: 1 }).id,
                quantity: 1
            },
            {
                id: productCollection.getById({ id: 2 }).id,
                quantity: 1
            },
            {
                id: productCollection.getById({ id: 3 }).id,
                quantity: 1
            }
        ]

        toAddItems.map(item => {
            cart.addOrUpdate(item)
        })

        const uniqueItemsCount = cart.getUniqueCounts()

        expect(uniqueItemsCount).toBe(3)
    })

    it('Can return the total count of items in cart', () => {
        const toAddItems = [
            {
                id: productCollection.getById({ id: 1 }).id,
                quantity: 1
            },
            {
                id: productCollection.getById({ id: 2 }).id,
                quantity: 1
            },
            {
                id: productCollection.getById({ id: 3 }).id,
                quantity: 5
            }
        ]

        toAddItems.map(item => {
            cart.addOrUpdate(item)
        })

        const totalItemsCount = cart.getTotalItemsCount()

        expect(totalItemsCount).toBe(7)
    })

    it('Can return the sub total amount of items in cart', () => {
        const toAddItems = [
            {
                ...productCollection.getById({ id: 1 }),
                quantity: 1
            },
            {
                ...productCollection.getById({ id: 2 }),
                quantity: 1
            },
            {
                ...productCollection.getById({ id: 3 }),
                quantity: 5
            }
        ]

        toAddItems.map(item => {
            cart.addOrUpdate(item)
        })

        const subTotalAmount = cart.getSubTotalAmount()

        expect(subTotalAmount).toBe(1450)
    })

    it('Can apply fixed discount and get discounted total amount', () => {
        const toAddItems = [
            {
                id: productCollection.getById({ id: 1 }).id,
                quantity: 1
            },
            {
                id: productCollection.getById({ id: 2 }).id,
                quantity: 1
            },
            {
                id: productCollection.getById({ id: 3 }).id,
                quantity: 5
            }
        ]

        toAddItems.map(item => {
            cart.addOrUpdate(item)
        })

        cart.applyDiscount({
            name: "Discount 2"
        })

        const totalAmount = cart.getTotalAmount()

        expect(totalAmount).toBe(1200)
    })

    it('Can apply fixed discount that exceed than cart value and get discounted total amount should be zero rather than negative value', () => {
        const toAddItems = [
            {
                id: productCollection.getById({ id: 1 }).id,
                quantity: 1
            },
        ]

        toAddItems.map(item => {
            cart.addOrUpdate(item)
        })

        cart.applyDiscount({
            name: "Discount 2"
        })

        const totalAmount = cart.getTotalAmount()

        expect(totalAmount).toBe(0)
    })

    it('Can apply percentage discount (100%) with max value (500) and get discounted total amount', () => {
        const toAddItems = [
            {
                id: productCollection.getById({ id: 1 }).id,
                quantity: 1
            },
            {
                id: productCollection.getById({ id: 2 }).id,
                quantity: 1
            },
            {
                id: productCollection.getById({ id: 3 }).id,
                quantity: 5
            }
        ]

        toAddItems.map(item => {
            cart.addOrUpdate(item)
        })

        cart.applyDiscount({
            name: "Discount 4"
        })

        const totalAmount = cart.getTotalAmount()

        expect(totalAmount).toBe(950)
    })

    it('Can apply percentage discount (50%) with no max value and get discounted total amount', () => {
        const toAddItems = [
            {
                id: productCollection.getById({ id: 1 }).id,
                quantity: 1
            },
            {
                id: productCollection.getById({ id: 2 }).id,
                quantity: 1
            },
            {
                id: productCollection.getById({ id: 3 }).id,
                quantity: 5
            }
        ]

        toAddItems.map(item => {
            cart.addOrUpdate(item)
        })

        cart.applyDiscount({
            name: "Discount 1"
        })

        const totalAmount = cart.getTotalAmount()

        expect(totalAmount).toBe(725)
    })

    it('Discount can be removed from cart', () => {
        cart.removeDiscount()
        
        expect(cart.getAppliedDiscount()).toBe(undefined)
    })

    it("Cart can be destoryed", () => {
        const toAddItems = [
            {
                id: productCollection.getById({ id: 1 }).id,
                quantity: 1
            },
            {
                id: productCollection.getById({ id: 2 }).id,
                quantity: 1
            },
            {
                id: productCollection.getById({ id: 3 }).id,
                quantity: 5
            }
        ]

        toAddItems.map(item => {
            cart.addOrUpdate(item)
        })

        cart.destory()

        expect(cart.getAll().length).toBe(0)
    })

    it("Cart is Empty (Positive)", () => {
        expect(cart.isEmpty()).toBe(true)
    })

    it("Cart is Empty (Negative)", () => {
        cart.addOrUpdate({
            id: productCollection.getById({ id: 1 }).id,
            quantity: 1
        })

        expect(cart.isEmpty()).toBe(false)
    })

    afterEach(() => {
        cart.destory()
    })
})