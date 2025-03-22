type statusType = 'success' | 'error'

export default class Status {
    type: statusType;
    message: string;

    constructor({ type, message }: Status) {
        this.type = type
        this.message = message

        console.log(message)
    }
}