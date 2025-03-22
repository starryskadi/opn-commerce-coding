export function isTestingEnvironment() {
    return process.env.JEST_WORKER_ID !== undefined;
}

export function isDevEnvironment() {
    return process.env.NODE_ENV !== 'production'
}