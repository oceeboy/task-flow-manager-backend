import { Injectable } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@Injectable()
@ApiTags('App') // Group this service under 'App' section in Swagger
export class AppService {
  @ApiOperation({ summary: 'Get a welcome message' }) // Description of this endpoint
  getHello(): string {
    return 'EveryThing BacKEND <h1> good</h1>';
  }
}
