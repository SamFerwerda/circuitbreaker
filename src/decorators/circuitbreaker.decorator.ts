import { Logger } from '@nestjs/common';
import * as Circuitbreaker from 'opossum';

enum CircuitStates {
  OPEN = 'open',
  HALF_OPEN = 'halfOpen',
  CLOSED = 'close',
  FAILURE = 'failure',
}; 

const defaultOptions: Circuitbreaker.Options = {
  timeout: 3000, // 3 seconds timeout on requests
  errorThresholdPercentage: 2, // 2% of the requests should fail for the circuit to open
  resetTimeout: 10000 // Wait for 10 second before trying the connection again
};

const defaultResponse = { success: false, message: 'Service temporarily unavailable' };

const activeBreakers: Record<string, Circuitbreaker> = {};
const logger = new Logger('CircuitBreaker');

function createBreaker({breaker, name, options}) {
  breaker.fallback(() => (options.fallbackResponse ?? defaultResponse));
  breaker.on(CircuitStates.OPEN, () => logger.warn(`Circuit opened for ${name} for ${options.resetTimeout} ms`));
  breaker.on(CircuitStates.HALF_OPEN, () => logger.warn(`Circuit half open for ${name} until next request`));
  breaker.on(CircuitStates.CLOSED, () => logger.warn(`Circuit close for ${name}`));
  breaker.on(CircuitStates.FAILURE, (err) => {
    logger.error(`Circuit failure for ${name} : Error - ${err}`);
});

  activeBreakers[name] = breaker;
  return breaker;
}

export function CircuitBreakerDecorator(settings: Partial<Circuitbreaker.Options & { fallbackResponse: Record<string, unknown> }> = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const options =  { ...defaultOptions, ...settings }
      const name = `${target.constructor.name}.${propertyKey}`;
      const breaker = activeBreakers[name] ?? createBreaker(
        {
          breaker: new Circuitbreaker(originalMethod.bind(this), options), 
          name, 
          options,
        });
      return breaker.fire(args);
    };
    
    return descriptor;
  };
}