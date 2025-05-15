import {
  Controller,
  All,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';

@Controller(['event', 'reward', 'user'])
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventProxyController {
  constructor(private readonly httpService: HttpService) {}

  @All('*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    const { method, body, headers, originalUrl } = req;
    const normalizedUrl = originalUrl.length > 1 ? originalUrl.replace(/\/$/, '') : originalUrl;
    try {
      const result = await firstValueFrom(
        this.httpService.request({
          method,
          url: `http://event:3002${normalizedUrl}`,
          headers: {
            ...headers,
            host: undefined, // host 헤더 제거 (필수)
          },
          data: body,
        }),
      );

      res.status(result.status).send(result.data);
    } catch (error) {
      const status = error?.response?.status || 500;
      const data = error?.response?.data || { message: 'Event 서버 요청 실패' };
      res.status(status).send(data);
    }
  }
}
