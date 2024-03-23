import { Body, Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Post } from '@nestjs/common';
import { CircuitBreaker } from './utils/circuitBreaker';
import { CircuitBreakerDecorator } from './decorators/circuitbreaker.decorator';

@Controller()
export class AppController {
  private settings: { duration: number, chance: number };
  options: {
    timeout: number; // If our function takes longer than 3 seconds, trigger a failure
    errorThresholdPercentage: number; // When 50% of requests fail, trip the circuit
    resetTimeout: number; // After 30 seconds, try again.
  };
  breaker: any;
  makeHttpCall: any;

  constructor(private readonly appService: AppService) {
    this.settings = {
      duration: 5000,
      chance: 0.3
    };

    this.makeHttpCall = new CircuitBreaker(
      this.appService.makeHttpCall.bind(this.appService),
      {name: 'makeHttpCall', defaultResponse: { success: false, message: 'Service temporarily unavailable' }}
    );
  }

  @Get('call')
  makeExternalCall(): Promise<unknown> {
    const random = Math.random();
    const duration = random < this.settings.chance ? this.settings.duration : 0;
    return this.makeHttpCall.request(duration);
  }

  @Post('settings')
  setSettings(@Body() settings: { duration: number, chance: number }): string {
    this.settings = {...this.settings, ...settings};
    return 'Settings updated';
  }

  @Get('stats')
  getStats(): Promise<unknown> {
    return this.breaker.toJSON();
  }

  @Get('callWithDecorator')
  @CircuitBreakerDecorator({ timeout: 3000, errorThresholdPercentage: 50, resetTimeout: 10000 })
  async makeExternalCallWithDecorator(): Promise<unknown> {
    const random = Math.random();
    const duration = random < this.settings.chance ? this.settings.duration : 0;
    return this.appService.makeHttpCall(duration);
  }
}
