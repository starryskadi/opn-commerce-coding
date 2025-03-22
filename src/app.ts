import Cart from "./cart.service";
import DiscountCollection, { Discount } from "./discount.service";
import { Freebies } from "./freebies.service";
import { ProductCollection } from "./product.service";

//#region Initialize Production Collection
const productCollection = new ProductCollection()

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
//#endregion

//#region Initialize Discount Collection 
const discountCollection = new DiscountCollection()

discountCollection.addBulk([
    new Discount({
        name: "Discount 1",
        amount: 50,
        type: 'percentage',
    }),
    new Discount({
        name: "Discount 2",
        amount: 250,
        type: 'fixed',
    }),
    new Discount({
        name: "Discount 3",
        amount: 500,
        type: 'fixed',
    }),
    new Discount({
        name: "Discount 4",
        amount: 100,
        type: 'percentage',
        maxAmount: 500
    }),
])

//#region Initialize Freebies

const freebies = new Freebies()

freebies.add({
    id: 1,
    buyX: productCollection.getById({ id: 1 }),
    getY: productCollection.getById({ id: 2 })
})

//#region Cart
const cart = new Cart()

// Product can be added to cart via product id

cart.addOrUpdate({
    id: 1,
    quantity: 200
})

// Confirm if freebies are working
console.log('[All Items]', cart.getAll())

cart.addOrUpdate({
    id: 2,
    quantity: 2
})

cart.addOrUpdate({
    id: 3,
    quantity: 3
})


// Cart can be updated via product id. This update must be an absolute update
// i.e. updating product id 1 with quantity of 10 will update the cart product id 1 in cart to quantity of 10

cart.addOrUpdate({
    id: 3, 
    quantity: 10
})

// Product can be remove from cart via product id
cart.remove({
    id: 3
})

cart.remove({
    id: 2
})

// Can check if product already exists

const isItemExist = cart.isItemExist({
    id: 1
})

console.log('[Is Item Exist]',isItemExist)

// Can list all items in cart
const allItems = cart.getAll()

console.log('[All Items]', allItems)

// Can count number of unique items in cart

const uniqueItemsCount = cart.getUniqueCounts()

console.log('[Unique Items]', uniqueItemsCount)


 
// Can return the total amount of items in cart
const totalItemsCount = cart.getTotalItemsCount()
const subTotalAmount = cart.getSubTotalAmount()

console.log('[Total Items Count]', totalItemsCount)
console.log('[SubTotal]', subTotalAmount)


//#endregion


//#region Discount Functionalities

cart.applyDiscount({
    name: "Discount 4"
})

const totalAmount = cart.getTotalAmount()

console.log('[Total Amount]', totalAmount) 

// Cart can be destroy
cart.destory()

// Can check if cart is empty
const isEmpty = cart.isEmpty()

console.log('[Is Empty]', isEmpty)

