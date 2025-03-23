import { Discount, DiscountCollection, IDiscount } from "../src/service/discount.service"

describe('Discount', () => {
    const discountCollection = DiscountCollection.getInstance()

    it('Fixed Discount can be created', () => {
        discountCollection.add({
            type: 'fixed',
            amount: 500,
            name: "Fixed"
        })

        expect(discountCollection.get({
            name: 'Fixed'
        })?.type).toBe('fixed')
    })
    
    it('Percentage Discount can be created', () => {
        discountCollection.add({
            type: 'percentage',
            amount: 100,
            name: "Percentage"
        })

        expect(discountCollection.get({
            name: 'Percentage'
        })?.type).toBe('percentage')
    })

    it('Percentage Discount should not be able to create if not between 1-100', () => {
        expect(() => discountCollection.add({
            type: 'percentage',
            amount: 500,
            name: "Percentage"
        })).toThrow(Error);
    })

    it('Multiple Discounts can be created', () => {
        const discounts: IDiscount[] = [
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
        ]

        const response = discountCollection.addBulk(discounts)

        expect(response).toEqual(discounts.map(each => new Discount(each)));
    })

    it('Get Discount', () => {
        const discounts: IDiscount[] = [
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
        ]

        discountCollection.addBulk(discounts)

        const response = discountCollection.get({
            name: "Discount 1"
        })

        expect(response?.name).toBe("Discount 1")
    })

    it('Discount can be deleted', () => {
        const discounts: IDiscount[] = [
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
        ]

        discountCollection.addBulk(discounts)

        discountCollection.remove({
            name: "Discount 3"
        })

        expect(
            () => discountCollection.get({
                name: "Discount 3"
            })
        ).toThrow(Error)
    })

    afterEach(() => {
        discountCollection.destory()
    })
})