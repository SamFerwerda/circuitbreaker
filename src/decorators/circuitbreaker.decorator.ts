import * as Circuitbreaker from 'opossum';

const defaultOptions = {
  timeout: 3000,
  errorThresholdPercentage: 1,
  resetTimeout: 10000,
  defaultResponse: { message: 'Default response' },
};

export function CircuitBreakerDecorator(settings: any = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const options =  { ...defaultOptions, ...settings }
      const breaker = new Circuitbreaker(originalMethod.bind(this), options);
      const name = options.name || propertyKey;
        
      breaker.fallback(() => (options.defaultResponse));
      breaker.on('open', () => console.log(`Circuit opened for ${name} for ${options.resetTimeout} ms`));
      breaker.on('halfOpen', () => console.log(`Circuit half open for ${name} until next request`));
      breaker.on('close', () => console.log(`Circuit close for ${name}`));
      breaker.on('failure', (error: any) => console.log(`Circuit error for ${name}: ${error}`));
      return breaker.fire(()=> originalMethod.apply(this, ...args));
    };
    
    return descriptor;
  };
}