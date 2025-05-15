import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthProxyController {
  constructor(private readonly httpService: HttpService) {}

  @Post('login')
  async login(@Body() body: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post('http://auth:3001/auth/login', body, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      return response.data;
    } catch (error) {
      // 응답이 없는 경우도 방어
      if (!error.response) {
        throw new HttpException('Auth 서버 응답 없음', HttpStatus.GATEWAY_TIMEOUT);
      }

      const { status, data } = error.response;

      throw new HttpException(
        {
          message: data?.message || 'Auth 요청 실패',
          error: data?.error || 'Gateway Error',
        },
        status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('register')
  async register(@Body() body: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post('http://auth:3001/auth/register', body, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw new HttpException('Auth 서버 응답 없음', HttpStatus.GATEWAY_TIMEOUT);
      }

      const { status, data } = error.response;

      throw new HttpException(
        {
          message: data?.message || '회원가입 실패',
          error: data?.error || 'Gateway Error',
        },
        status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
