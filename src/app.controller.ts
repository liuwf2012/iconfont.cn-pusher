import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('iconfont-get/:pid')
  getIconfont(@Param('pid') pid): string {
    const data = this.appService.getProject(pid);
    if (data === null) {
      throw new HttpException('project unfound', HttpStatus.BAD_REQUEST);
    }
    return data;
  }

  @Post('iconfont-post/:pid')
  @HttpCode(200)
  postIconfont(@Param('pid') pid, @Body() body): any {
    const result = this.appService.setProject(pid, body);
    if (!result) {
      throw new HttpException('failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return { code: 200, msg: 'success' };
  }
}
