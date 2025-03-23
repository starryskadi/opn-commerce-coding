import Cart from "../src/service/cart.service";
import { DiscountCollection } from "../src/service/discount.service";
import { FreebiesCollection } from "../src/service/freebies.service";
import { ProductCollection } from "../src/service/product.service";

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
 
    //#region Positive Cases
    it('Product can be added to cart via product id', () => {
        const product = productCollection.getById({ id: 1});
        
        cart.add({
            id: product.id,
        })

        expect(cart.getById(product)).toEqual({
            ...product,
            quantity: 1,
            freeQuantity: 0
        })
    })


    // Cart can be updated via product id. This update must be an absolute update
    // i.e. updating product id 1 with quantity of 10 will update the cart product id 1 in cart to quantity of 10
    it('Product can be updated to cart via product id with absolute quantity', () => {
        // Initialize the product
        cart.add({
            id: productCollection.getById({ id: 1 }).id,
        })

        const updatedProduct = {
            id: productCollection.getById({ id: 1 }).id, 
            quantity: 10
        }

        cart.update(updatedProduct)

        expect(cart.getById({
            id: 1
        })?.quantity).toBe(10)
    })

    it('Product can be remove from cart via product id', () => {
        cart.add({
            id: productCollection.getById({ id: 1 }).id,
        })

        cart.add({
            id: productCollection.getById({ id: 2 }).id,
        })

        cart.add({
            id: productCollection.getById({ id: 3 }).id,
        })

        cart.remove({
            id: productCollection.getById({ id: 3 }).id
        })

        expect(cart.getAll()).toEqual([
            { ...productCollection.getById({ id: 1 }), quantity: 1, freeQuantity: 0},
            { ...productCollection.getById({ id: 2 }), quantity: 1, freeQuantity: 0}
        ])
    })

    it('Can check if product already exists', () => {
        cart.add({
            id: productCollection.getById({ id: 1}).id,
        })

        const isItemExist = cart.isItemExist({
            id: 1
        })

        expect(isItemExist).toBe(true)
    })

    it('Freebies automatically added to cart via product id', () => {
        [
            {
                id: 1,
                buyX: productCollection.getById({ id: 1 }),
                getY: productCollection.getById({ id: 2 }),
                buyXQuantity: 1,
                getYQuantity: 5,
                once: false
            },
            {
                id: 2,
                buyX: productCollection.getById({ id: 1 }),
                getY: productCollection.getById({ id: 2 }),
                buyXQuantity: 1,
                getYQuantity: 20,
                once: true
            },
            {
                id: 3,
                buyX: productCollection.getById({ id: 1 }),
                getY: productCollection.getById({ id: 2 }),
                buyXQuantity: 1,
                getYQuantity: 25,
                once: true
            }
        ].map(freebie => {
            freebies.add(freebie)
        })

        cart.add({
            id: productCollection.getById({ id: 1}).id,
        })

       expect(cart.getById({
            id: 2
        })?.freeQuantity).toBe(50)
    })

    it('Freebies must not be charged', () => {
        const addedFreebie = {
            id: 1,
            buyX: productCollection.getById({ id: 1 }),
            getY: productCollection.getById({ id: 2 }),
            buyXQuantity: 1,
            getYQuantity: 5,
            once: false
        }

        freebies.add(addedFreebie)

        cart.add({
            id: productCollection.getById({ id: 1}).id,
        })

        expect(cart.getSubTotalAmount()).toBe(50)
    })

    it('If item is removed, freebies must be removed', () => {
        const addedFreebie = {
            id: 1,
            buyX: productCollection.getById({ id: 1 }),
            getY: productCollection.getById({ id: 2 }),
            buyXQuantity: 1,
            getYQuantity: 5,
            once: false
        }

        freebies.add(addedFreebie)

        cart.add({
            id: productCollection.getById({ id: 1}).id,
        })

        cart.remove({
            id: productCollection.getById({ id: 1}).id,
        })

        expect(cart.getById({ id: 2 })?.freeQuantity).toBe(0)
    })

    it('If item is reduced, freebies must be reduced (once freebie)', () => {
        const addedFreebie = {
            id: 1,
            buyX: productCollection.getById({ id: 1 }),
            getY: productCollection.getById({ id: 2 }),
            buyXQuantity: 3,
            getYQuantity: 5,
            once: true
        }

        freebies.add(addedFreebie)

        cart.add({
            id: productCollection.getById({ id: 1}).id,
        })

        cart.update({
            id: productCollection.getById({ id: 1}).id,
            quantity: 6
        })

        cart.update({
            id: productCollection.getById({ id: 1}).id,
            quantity: 3
        })
        
        expect(cart.getById({ id: 2 })?.freeQuantity).toBe(5)
    })

    it('If the item is reduced to zero, item must be removed', () => {
        cart.add({
            id: productCollection.getById({ id: 1}).id,
        })

        cart.update({
            id: productCollection.getById({ id: 1}).id,
            quantity: 0
        })
        
        expect(cart.getById({ id: 1 })).toBeUndefined()
    })

    it('Can list all items in cart', () => {
        const toAddItems = [
            {
                id: productCollection.getById({ id: 1 }).id,
            },
            {
                id: productCollection.getById({ id: 2 }).id,
            },
            {
                id: productCollection.getById({ id: 3 }).id,
            }
        ]

        toAddItems.map(item => {
            cart.add(item)
        })

        expect(cart.getAll().map(each => ({ id: each.id, quantity: each.quantity }))).toEqual(toAddItems.map(each => ({ id: each.id, quantity: 1 })))
    })

    it('Can count number of unique items in cart', () => {
        const toAddItems = [
            {
                id: productCollection.getById({ id: 1 }).id,
            },
            {
                id: productCollection.getById({ id: 2 }).id,
            },
            {
                id: productCollection.getById({ id: 3 }).id,
            }
        ]

        toAddItems.map(item => {
            cart.add(item)
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
            cart.add(item)
            cart.update({
                id: item.id,
                quantity: item.quantity
            })
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
            cart.add(item)
            cart.update({
                id: item.id,
                quantity: item.quantity
            })
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
            cart.add(item)
            cart.update({
                id: item.id,
                quantity: item.quantity
            })
        })

        cart.applyDiscount({
            name: "Discount 2"
        })

        const totalAmount = cart.getTotalAmount()

        expect(totalAmount).toBe(1200)
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
            cart.add(item)
            cart.update({
                id: item.id,
                quantity: item.quantity
            })
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
            cart.add(item)
            cart.update({
                id: item.id,
                quantity: item.quantity
            })
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
            cart.add(item)
            cart.update({
                id: item.id,
                quantity: item.quantity
            })
        })

        cart.destory()

        expect(cart.getAll().length).toBe(0)
    })

    it("Cart is Empty", () => {
        expect(cart.isEmpty()).toBe(true)
    })


    //#endregion Positive Cases

    //#region Negative Cases

    it('Non-existed Product must not be able to add to cart', () => {
        expect(() => cart.add({
            id: 10,
        })).toThrow()
    })

    it('Non-existed Product must not be able to update', () => {
        expect(() => cart.update({
            id: 10,
            quantity: 50
        })).toThrow()
    })

    it('Non-existed Product must not be able to delete', () => {
        expect(() => cart.remove({
            id: 10,
        })).toThrow()
    })

    it('Product should not be able to updated with negative quantity', () => {
        expect(() => cart.update({
            id: 1,
            quantity: -10
        })).toThrow()
    })

    it('Can apply fixed discount that exceed than cart value and get discounted total amount should be zero rather than negative value', () => {
        const toAddItems = [
            {
                id: productCollection.getById({ id: 1 }).id,
                quantity: 1
            },
        ]

        toAddItems.map(item => {
            cart.add(item)
        })

        cart.applyDiscount({
            name: "Discount 2"
        })

        const totalAmount = cart.getTotalAmount()

        expect(totalAmount).toBe(0)
    })

    //#endregion Negative Cases

    afterEach(() => {
        cart.destory()
        freebies.destory()
    })

    afterAll(() => {
        productCollection.destory()
        discountCollection.destory()
    })
})