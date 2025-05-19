import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { disconnect } from 'mongoose';

jest.setTimeout(20000);

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const users = [
    { email: 'admin@e2e.com', password: '1234', role: 'admin' },
    { email: 'operator@e2e.com', password: '1234', role: 'operator' },
    { email: 'user@e2e.com', password: '1234', role: 'user' },
    { email: 'auditor@e2e.com', password: '1234', role: 'auditor' },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await disconnect();
  });

  it('✅ 각 역할별 회원가입 (이미 있으면 409)', async () => {
    for (const user of users) {
      const res = await request(app.getHttpServer()).post('/auth/register').send(user);
      expect([201, 409]).toContain(res.statusCode);
    }
  });

  it('✅ 각 계정 로그인 및 토큰 확인', async () => {
    for (const user of users) {
      const res = await request(app.getHttpServer()).post('/auth/login').send({
        email: user.email,
        password: user.password,
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
    }
  });
});