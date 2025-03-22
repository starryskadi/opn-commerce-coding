import { FreebiesCollection } from "../src/service/freebies.service";
import { ProductCollection } from "../src/service/product.service";

describe('Freebies', () => {
    const freebiesCollection = new FreebiesCollection()
    const productCollection = new ProductCollection()

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
    })

    it('Freebies can be created', () => {
        const freebie = {
            id: 1, 
            buyX: {
                id: 1
            },
            getY: {
                id: 1
            }
        }

        freebiesCollection.add(freebie)

        expect(freebiesCollection.getById({
            id: 1
        })?.id).toEqual(freebie.id)
    })
    
    it('Get All Freebies by Product id', () => {
        const freebies = [
            {
                id: 1, 
                buyX: {
                    ...productCollection.getById({ id: 1 })
                },
                getY: {
                    ...productCollection.getById({ id: 1 })
                }
            }, 
            {
                id: 2, 
                buyX: {
                    ...productCollection.getById({ id: 1 })
                },
                getY: {
                    ...productCollection.getById({ id: 2 })
                }
            },
            {
                id: 3, 
                buyX: {
                    ...productCollection.getById({ id: 2 })
                },
                getY: {
                    ...productCollection.getById({ id: 3 })
                }
            }
        ]

        freebies.map(freebie => {
            freebiesCollection.add(freebie)
        })

        const response = freebiesCollection.getAllByBuyX({
            id: 1
        })

        expect(response).toEqual([
            {
                id: 1, 
                buyX: {
                    ...productCollection.getById({ id: 1 })
                },
                getY: {
                    ...productCollection.getById({ id: 1 })
                }
            }, 
            {
                id: 2, 
                buyX: {
                    ...productCollection.getById({ id: 1 })
                },
                getY: {
                    ...productCollection.getById({ id: 2 })
                }
            }
        ])
    })

    it('Freebies can be deleted', () => {
        const freebies = [
            {
                id: 1, 
                buyX: {
                    ...productCollection.getById({ id: 1 })
                },
                getY: {
                    ...productCollection.getById({ id: 1 })
                }
            }, 
            {
                id: 2, 
                buyX: {
                    ...productCollection.getById({ id: 1 })
                },
                getY: {
                    ...productCollection.getById({ id: 2 })
                }
            },
            {
                id: 3, 
                buyX: {
                    ...productCollection.getById({ id: 2 })
                },
                getY: {
                    ...productCollection.getById({ id: 3 })
                }
            }
        ]

        freebies.map(freebie => {
            freebiesCollection.add(freebie)
        })

        freebiesCollection.remove({
            id: 1
        })

        expect(
            () => freebiesCollection.getById({
                id: 1
            })
        ).toThrow(Error)
    })

    afterEach(() => {
        freebiesCollection.destory()
    })
})