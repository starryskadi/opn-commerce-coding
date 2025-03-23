import { EventEmitter } from 'events'

let instance: EventService;

export default class EventService extends EventEmitter {
    constructor() {
        super()
        if (instance) {
            return instance;
        }
        instance = this;
    }
}

export const EVENTS = {
    CART_UPDATED: 'cart.updated',
    CALCULATE_FREEBIES: 'cart.calculate_freebies'
}
