import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CircuitBreakerDecorator } from './decorators/circuitbreaker.decorator';

const URL = 'https://httpstat.us/200?sleep='

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {
  }
  
  async makeHttpCall(duration: number) {
    try {
      const response = this.httpService.get(URL+duration);
      const result = await firstValueFrom(response);
      return result.data;
    } catch (error) {
      console.error(error);
      return 'An error has occured. Please try again later.';
    }
  }

  @CircuitBreakerDecorator({ timeout: 3000, errorThresholdPercentage: 5, resetTimeout: 10000, fallbackResponse: { success: false, message: 'Unfortunately, our services are currently unavailable.' }})
  async makeHttpCallWithDecorator(duration: number) {
    try {
      const response = this.httpService.get(URL+duration);
      const result = await firstValueFrom(response);
      return result.data;
    } catch (error) {
      console.error(error);
      return 'An error has occured. Please try again later.';
    }
  }
}
