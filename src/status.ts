import { isDevEnvironment, isTestingEnvironment } from "./utils";

type statusType = 'success'

export default class Status {
    type: statusType;
    message: string;

    constructor({ type, message }: Status) {
        this.type = type
        this.message = message

        if (!isTestingEnvironment() && isDevEnvironment()) {
            console.log(this.message)
        }
    }
}