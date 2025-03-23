import { EventEmitter } from 'events'

export default class EventService extends EventEmitter {
    private static instance: EventService;

    private constructor() {
        super()   
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new EventService()
        }

        return this.instance
    }
}

export const EVENTS = {
    CART_UPDATED: 'cart.updated',
}
