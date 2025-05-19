import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { disconnect } from 'mongoose';

jest.setTimeout(20000);

describe('Event 서버 전체 권한 테스트 (e2e)', () => {
  let app: INestApplication;
  const tokens: Record<string, string> = {};

  const roles = ['admin', 'operator', 'user', 'auditor'];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    for (const role of roles) {
      const res = await request(app.getHttpServer()).post('/auth/login').send({
        email: `${role}@e2e.com`,
        password: '1234',
      });
      tokens[role] = res.body.token;
    }
  });

  afterAll(async () => {
    await app.close();
    await disconnect();
  });

  const expectRole = async ({
    method,
    url,
    role,
    body,
    expectedStatus,
  }: {
    method: 'get' | 'post' | 'patch' | 'delete';
    url: string;
    role: string;
    body?: any;
    expectedStatus: number;
  }) => {
    const res = await request(app.getHttpServer())[method](url)
      .set('Authorization', `Bearer ${tokens[role]}`)
      .send(body);

    expect(res.status).toBe(expectedStatus);
  };

  describe('RewardController 권한 체크', () => {
    for (const role of roles) {
      it(`${role} → POST /reward`, async () => {
        await expectRole({
          method: 'post',
          url: '/reward',
          role,
          body: {
            item: {
              name: '넥슨캐시 1000',
              type: 'coupon', // 또는 'point', 'item', 등 적절한 타입
            },
            total_quantity: 10
          },
          expectedStatus: ['admin', 'operator'].includes(role) ? 201 : 403,
        });
      });

      it(`${role} → GET /reward`, async () => {
        await expectRole({
          method: 'get',
          url: '/reward',
          role,
          expectedStatus: 200,
        });
      });

      it(`${role} → PATCH /reward/1`, async () => {
        await expectRole({
          method: 'patch',
          url: '/reward/1',
          role,
          body: {
            item: {
              item: '수정된 출석 보상',
              item_type: 'point', // 기존 값과 같거나 유효한 타입으로 넣어야 함
            }
          },
          expectedStatus: ['admin', 'operator'].includes(role) ? 200 : 403,
        });
      });

      it(`${role} → DELETE /reward/1`, async () => {
        await expectRole({
          method: 'delete',
          url: '/reward/1',
          role,
          expectedStatus: role === 'admin' ? 200 : 403,
        });
      });
    }
  });

  describe('EventController 권한 체크', () => {
    for (const role of roles) {
      it(`${role} → POST /event`, async () => {
        await expectRole({
          method: 'post',
          url: '/event',
          role,
          body: {
            title: '출석 이벤트',
            content: '보상을 드려요!',
            date: {
              start_date: '2025-06-01T00:00:00.000Z',
              end_date: '2025-06-07T00:00:00.000Z',
            },
            condition: '7',
            valid: true,
          },
          expectedStatus: ['admin', 'operator'].includes(role) ? 201 : 403,
        });
      });

      it(`${role} → GET /event`, async () => {
        await expectRole({
          method: 'get',
          url: '/event',
          role,
          expectedStatus: 200,
        });
      });

      it(`${role} → PATCH /event/1`, async () => {
        await expectRole({
          method: 'patch',
          url: '/event/1',
          role,
          body: { title: '수정된 이벤트' },
          expectedStatus: ['admin', 'operator'].includes(role) ? 200 : 403,
        });
      });

      it(`${role} → DELETE /event/1`, async () => {
        await expectRole({
          method: 'delete',
          url: '/event/1',
          role,
          expectedStatus: role === 'admin' ? 200 : 403,
        });
      });
    }
  });

  describe('UserParticipationController 권한 체크', () => {
  for (const role of roles) {
    it(`${role} → POST /user/participate`, async () => {
      await expectRole({
        method: 'post',
        url: '/user/participate',
        role,
        body: { event_id: 1 , condition : 1 },
        expectedStatus: ['user', 'admin'].includes(role) ? 201 : 403,
      });
    });

    it(`${role} → GET /user/me`, async () => {
      await expectRole({
        method: 'get',
        url: '/user/me',
        role,
        expectedStatus: ['user', 'admin'].includes(role) ? 200 : 403,
      });
    });

    it(`${role} → GET /user`, async () => {
      await expectRole({
        method: 'get',
        url: '/user',
        role,
        expectedStatus: ['admin', 'auditor', 'operator'].includes(role) ? 200 : 403,
      });
    });

    it(`${role} → PATCH /user/complete/1`, async () => {
      await expectRole({
        method: 'patch',
        url: '/user/complete/1',
        role,
        expectedStatus: ['user', 'admin'].includes(role) ? 200 : 403,
      });
    });
  }
});
});
