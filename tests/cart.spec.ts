import Cart, { CartItem } from "../src/service/cart.service";
import { DiscountCollection } from "../src/service/discount.service";
import { FreebiesCollection } from "../src/service/freebies.service";
import { Product, ProductCollection } from "../src/service/product.service";

describe("Cart", () => {
    const productCollection = ProductCollection.getInstance()
    const discountCollection = DiscountCollection.getInstance()
    const freebies = FreebiesCollection.getInstance()
    const cart = Cart.getInstance()

    beforeAll(() => {
        productCollection.addBulk([
            {
                name: 'Product 1',
                price: 50
            }, 
            {
                name: 'Product 2',
                price: 150
            }, 
            {
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
        cart.add({
            productId: 1,
        })

        expect(cart.getById({
            productId: 1
        })).toEqual(new CartItem({
            productId: 1,
            quantity: 1,
            freeQuantity: 0
        }))
    })


    // Cart can be updated via product id. This update must be an absolute update
    // i.e. updating product id 1 with quantity of 10 will update the cart product id 1 in cart to quantity of 10
    it('Product can be updated to cart via product id with absolute quantity', () => {
        // Initialize the product
        cart.add({
            productId: 1,
        })

        const updatedProduct = {
            productId: 1, 
            quantity: 10
        }

        cart.update(updatedProduct)

        expect(cart.getById({
            productId: 1
        })?.quantity).toBe(10)
    })

    it('Product can be remove from cart via product id', () => {
        cart.add({
            productId:  1,
        })

        cart.add({
            productId: 2,
        })

        cart.add({
            productId: 3,
        })

        cart.remove({
            productId: 3,
        })

        expect(cart.getAll()).toEqual([
            new CartItem({ productId: 1, quantity: 1, freeQuantity: 0}),
            new CartItem({ productId: 2, quantity: 1, freeQuantity: 0})
        ])
    })


    it('Non-existed Product must not be able to add to cart', () => {
        expect(() => cart.add({
            productId: 10,
        })).toThrow()
    })

    it('Non-existed Product must not be able to update', () => {
        expect(() => cart.update({
            productId: 10,
            quantity: 50
        })).toThrow()
    })

    it('Non-existed Product must not be able to delete', () => {
        expect(() => cart.remove({
            productId: 10,
        })).toThrow()
    })

    it('Product should not be able to updated with negative quantity', () => {
        cart.add({
            productId: 1,
        })

        expect(() => cart.update({
            productId: 1,
            quantity: -10
        })).toThrow()
    })

    it('Can check if product already exists', () => {
        cart.add({
            productId: 1,
        })

        const isItemExist = cart.isItemExist({
            productId: 1,
        })

        expect(isItemExist).toBe(true)
    })

    it('Freebies automatically added to cart via product id', () => {
        [
            {
                id: 1,
                buyX: {
                    id: 1
                },
                getY: {
                    id: 2
                },
                buyXQuantity: 1,
                getYQuantity: 5,
                once: false
            },
            {
                id: 2,
                buyX: {
                    id: 1
                },
                getY: {
                    id: 2
                },
                buyXQuantity: 1,
                getYQuantity: 20,
                once: true
            },
            {
                id: 3,
                buyX: {
                    id: 1
                },
                getY: {
                    id: 2
                },
                buyXQuantity: 1,
                getYQuantity: 25,
                once: true
            }
        ].map(freebie => {
            freebies.add(freebie)
        })

        cart.add({
            productId: 1,
        })

       expect(cart.getById({
            productId: 2
        })?.freeQuantity).toBe(50)
    })

    it('Freebies must not be charged', () => {
        const addedFreebie = {
            id: 1,
            buyX: {
                id: 1
            },
            getY: {
                id: 2
            },
            buyXQuantity: 1,
            getYQuantity: 5,
            once: false
        }

        freebies.add(addedFreebie)

        cart.add({
            productId: 1,
        })

        expect(cart.getSubTotalAmount()).toBe(50)
    })

    it('If item is removed, freebies must be removed', () => {
        const addedFreebie = {
            id: 1,
            buyX: {
                id: 1
            },
            getY: {
                id: 2
            },
            buyXQuantity: 1,
            getYQuantity: 5,
            once: false
        }

        freebies.add(addedFreebie)

        cart.add({
            productId: 1,
        })

        cart.remove({
            productId: 1,
        })

        expect(cart.getById({
            productId: 2
        })?.freeQuantity).toBe(0)
    })

    it('If item is reduced, freebies must be reduced (once freebie)', () => {
        const addedFreebie = {
            id: 1,
            buyX: {
                id: 1
            },
            getY: {
                id: 2
            },
            buyXQuantity: 3,
            getYQuantity: 5,
            once: true
        }

        freebies.add(addedFreebie)

        cart.add({
            productId: 1,
        })

        cart.update({
            productId: 1,
            quantity: 6
        })

        cart.update({
            productId: 1,
            quantity: 3
        })
        expect(cart.getById({ productId: 2 })?.freeQuantity).toBe(5)
    })

    it('If the item is reduced to zero, item must be removed', () => {
        cart.add({
            productId: 1,
        })

        cart.update({
            productId: 1,
            quantity: 0
        })
        
        expect(() => cart.getById({ productId: 1 })).toThrow()
    })

    it('Can list all items in cart', () => {
        const toAddItems = [
            {
                productId: 1,
            },
            {
                productId: 2,
            },
            {
                productId: 3,
            }
        ]

        toAddItems.map(item => {
            cart.add(item)
        })

        expect(cart.getAll().map(each => ({ productId: each.productId, quantity: each.quantity }))).toEqual(toAddItems.map(each => ({ productId: each.productId, quantity: 1 })))
    })

    it('Can count number of unique items in cart', () => {
        const toAddItems = [
            {
                productId: 1,
            },
            {
                productId: 2,
            },
            {
                productId: 3,
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
                productId: 1,
                quantity: 1
            },
            {
                productId: 2,
                quantity: 1
            },
            {
                productId: 3,
                quantity: 5
            }
        ]

        toAddItems.map(item => {
            cart.add(item)
            cart.update({
                productId: item.productId,
                quantity: item.quantity
            })
        })

        const totalItemsCount = cart.getTotalItemsCount()

        expect(totalItemsCount).toBe(7)
    })

    it('Can return the sub total amount of items in cart', () => {
        const toAddItems = [
            {
                productId: 1,
                quantity: 1
            },
            {
                productId: 2,
                quantity: 1
            },
            {
                productId: 3,
                quantity: 5
            }
        ]

        toAddItems.map(item => {
            cart.add(item)
            cart.update({
                productId: item.productId,
                quantity: item.quantity
            })
        })

        const subTotalAmount = cart.getSubTotalAmount()

        expect(subTotalAmount).toBe(1450)
    })

    it('Can apply fixed discount and get discounted total amount', () => {
        const toAddItems = [
            {
                productId: 1,
                quantity: 1
            },
            {
                productId: 2,
                quantity: 1
            },
            {
                productId: 3,
                quantity: 5
            }
        ]

        toAddItems.map(item => {
            cart.add(item)
            cart.update({
                productId: item.productId,
                quantity: item.quantity
            })
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
                productId: 1,
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

    it('Can apply percentage discount (100%) with max value (500) and get discounted total amount', () => {
        const toAddItems = [
            {
                productId: 1,
                quantity: 1
            },
            {
                productId: 2,
                quantity: 1
            },
            {
                productId: 3,
                quantity: 5
            }
        ]

        toAddItems.map(item => {
            cart.add(item)
            cart.update({
                productId: item.productId,
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
                productId: 1,
                quantity: 1
            },
            {
                productId: 2,
                quantity: 1
            },
            {
                productId: 3,
                quantity: 5
            }
        ]

        toAddItems.map(item => {
            cart.add(item)
            cart.update({
                productId: item.productId,
                quantity: item.quantity
            })
        })

        cart.applyDiscount({
            name: "Discount 1"
        })

        const totalAmount = cart.getTotalAmount()

        expect(totalAmount).toBe(725)
    })  
    
    it('Can apply multiple discounts (50% and 250) and get discounted total amount', () => {
        const toAddItems = [
            {
                productId: 3,
                quantity: 100
            }
        ]

        toAddItems.map(item => {
            cart.add(item)
            cart.update({
                productId: item.productId,
                quantity: item.quantity
            })
        })

        cart.applyDiscount({
            name: "Discount 1"
        }) 

        cart.applyDiscount({
            name: "Discount 2"
        })
        
        const totalAmount = cart.getTotalAmount()

        expect(totalAmount).toBe(12250)
    })

    it('Can apply multiple discounts (50% and 250) and remove one discount (250), and get discounted total amount', () => {
        const toAddItems = [
            {
                productId: 3,
                quantity: 100
            }
        ]

        toAddItems.map(item => {
            cart.add(item)
            cart.update({
                productId: item.productId,
                quantity: item.quantity
            })
        })

        cart.applyDiscount({
            name: "Discount 1"
        }) 

        cart.applyDiscount({
            name: "Discount 2"
        })

        cart.removeDiscount({
            name: "Discount 2"
        })
        
        const totalAmount = cart.getTotalAmount()

        expect(totalAmount).toBe(12500)
    })

    it('Discount can be removed from cart', () => {
        cart.applyDiscount({
            name: "Discount 1"
        })

        cart.removeDiscount({
            name: "Discount 1"
        })
        
        expect(cart.getAppliedDiscount()).toEqual([])
    })

    it("Cart can be destoryed", () => {
        const toAddItems = [
            {
                productId: 1,
                quantity: 1
            },
            {
                productId: 2,
                quantity: 1
            },
            {
                productId: 3,
                quantity: 5
            }
        ]

        toAddItems.map(item => {
            cart.add(item)
            cart.update({
                productId: item.productId,
                quantity: item.quantity
            })
        })

        cart.destory()

        expect(cart.getAll().length).toBe(0)
    })

    it("Cart is Empty", () => {
        expect(cart.isEmpty()).toBe(true)
    })

    afterEach(() => {
        cart.destory()
        freebies.destory()
    })

    afterAll(() => {
        productCollection.destory()
        discountCollection.destory()
    })
})