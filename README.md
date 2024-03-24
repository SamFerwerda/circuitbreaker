## Description

In this repo I have played around a bit with circuit breaking. I have implemented 3 different solutions:
- 1. Use opossum directly in the service / controller where I want to use it
- 2. Create a CircuitBreaker class that initiates a circuitbreaker from opossum, but with the extra stuff required for logging, options etc. (reduces duplicate code lines)
- 3. Implemented a CircuitBreaker decorator that uses opposum. This decorator can then be added to a controller function or to a service function!

## Result
- 1. I've discarded this solution. It would work fine if you need only one circuit breaker, the problem arises if you need more than one (e.g. a CB per external service). You will get a lot of duplicate lines.
- 2. I've implemented this method in the ```src/utils/circuitBreaker.ts``` file and then used in in the ```src/app.controller.ts``` within the /call endpoint. The only downside for this right now is that I dont like that I have to initiate the circuit breaker in the constructor for it to be used in the /call endpoint. Technically it also requires a little more effort from the programmer to see what object you actually need to bind to the method you are providing in the circuit breaker. 
- 3. By far my favorite implementation at this moment is with the help of the decorator, created in the ```src/decorators/circuitbreaker.decorator.ts``` and then used as a decorater in both the app.controller.ts if you want to use it on controller level, but can also be used on service level. This has been done in the app.service.ts.

## Conclusion
I would suggest to use decorators as they improve readability and are super easy to implement once the decorator itself has been created.