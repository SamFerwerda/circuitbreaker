import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

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
}
