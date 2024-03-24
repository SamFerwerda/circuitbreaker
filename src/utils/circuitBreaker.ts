import * as circuitbreaker from 'opossum';

export class CircuitBreaker {
    private breaker: circuitbreaker<unknown[], unknown>;
    private name: string;

    private defaultOptions = {
        timeout: 3000,
        errorThresholdPercentage: 5,
        resetTimeout: 10000,
        defaultResponse: { message: 'Default response' },
    }

    constructor(private readonly func: ()=> Promise<unknown>, private readonly options: any = {}) {
        this.name = options.name;
        this.options = { ...this.defaultOptions, ...options };

        this.breaker = new circuitbreaker(this.func, this.options);
        this.breaker.fallback(() => (this.options.defaultResponse));
        this.breaker.on('open', () => console.log(`Circuit opened for ${this.name} for ${this.options.resetTimeout} ms`));
        this.breaker.on('halfOpen', () => console.log(`Circuit half open for ${this.name} until next request`));
        this.breaker.on('close', () => console.log(`Circuit close for ${this.name}`));
        return this;
    }
    
    request(params: unknown): Promise<unknown> {
        return this.breaker.fire(params);
    }
}