import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  async getJewels(
    @Body()
    dto: {
      type: string;
      ids: number[];
      weights: { [key: string]: number };
    },
  ): Promise<any> {
    return this.appService.getJewels(
      dto.type,
      dto.ids || [],
      dto.weights || {},
    );
  }
}
