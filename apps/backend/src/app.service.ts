import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'QUE SUCEDE CAUSA';
  }
}
