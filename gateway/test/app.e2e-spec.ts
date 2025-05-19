import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

jest.setTimeout(30000);

describe('🔗 Gateway 전체 API e2e 테스트 (권한 + 프록시)', () => {
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
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: `${role}@e2e.com`, password: '1234' });
      tokens[role] = res.body.token;
    }
  });

  afterAll(async () => {
    await app.close();
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
    expectedStatus: number | number[];
  }) => {
    const res = await request(app.getHttpServer())[method](url)
      .set('Authorization', `Bearer ${tokens[role]}`)
      .send(body);

    Array.isArray(expectedStatus)
      ? expect(expectedStatus).toContain(res.status)
      : expect(res.status).toBe(expectedStatus);
  };

  const getExpectedText = (v: number | number[]) => Array.isArray(v) ? v.join(', ') : v;

  describe('✅ RewardController', () => {
    for (const role of roles) {
      const expected = ['admin', 'operator'].includes(role) ? 201 : 403;
      it(`${role} → POST /reward`, async () => {
        await expectRole({
          method: 'post',
          url: '/reward',
          role,
          body: {
            item: {
              name: '넥슨캐시 1000',
              item_type: 'coupon',
            },
            total_quantity: 10,
          },
          expectedStatus: ['admin', 'operator'].includes(role) ? 201 : 403,
        });
      });

      const expectedGet = ['admin', 'operator'].includes(role) ? 200 : 403;
      it(`${role} → GET /reward (예상: ${getExpectedText(expectedGet)})`, async () => {
        await expectRole({
          method: 'get',
          url: '/reward',
          role,
          expectedStatus: expectedGet,
        });
      });

      const expectedPatch = ['admin', 'operator'].includes(role) ? 200 : 403;
      it(`${role} → PATCH /reward/1 (예상: ${getExpectedText(expectedPatch)})`, async () => {
        await expectRole({
          method: 'patch',
          url: '/reward/1',
          role,
          body: { item: {name : '수정된 보상',item_type:'수정된 타입'} },
          expectedStatus: expectedPatch,
        });
      });
    }
  });

  describe('✅ EventController', () => {
    for (const role of roles) {
      const expected = ['admin', 'operator'].includes(role) ? [201,400] : 403;
      it(`${role} → POST /event (예상: ${getExpectedText(expected)})`, async () => {
        await expectRole({
          method: 'post',
          url: '/event',
          role,
          body: {
            title: '이벤트',
            content: '내용',
            reward_id: 1,
            date: {
              start_date: '2025-06-01T00:00:00.000Z',
              end_date: '2025-06-07T00:00:00.000Z',
            },
            condition: 10,
            valid: true,
          },
          expectedStatus: expected,
        });
      });

      it(`${role} → GET /event (예상: 200)`, async () => {
        await expectRole({
          method: 'get',
          url: '/event',
          role,
          expectedStatus: 200,
        });
      });

      const expectedPatch = ['admin', 'operator'].includes(role) ? 200 : 403;
      it(`${role} → PATCH /event/1 (예상: ${getExpectedText(expectedPatch)})`, async () => {
        await expectRole({
          method: 'patch',
          url: '/event/1',
          role,
          body: { title: '수정됨' },
          expectedStatus: expectedPatch,
        });
      });
    }
  });

  describe('✅ UserParticipationController', () => {
    for (const role of roles) {
      const expected = ['user', 'admin'].includes(role) ? [201, 400] : 403;
      it(`${role} → POST /user/participate (예상: ${getExpectedText(expected)})`, async () => {
        await expectRole({
          method: 'post',
          url: '/user/participate',
          role,
          body: { event_id: 1 },
          expectedStatus: expected,
        });
      });

      const expectedMe = ['user', 'admin'].includes(role) ? 200 : 403;
      it(`${role} → GET /user/me (예상: ${getExpectedText(expectedMe)})`, async () => {
        await expectRole({
          method: 'get',
          url: '/user/me',
          role,
          expectedStatus: expectedMe,
        });
      });

      const expectedAll = ['admin', 'auditor', 'operator'].includes(role) ? 200 : 403;
      it(`${role} → GET /user (예상: ${getExpectedText(expectedAll)})`, async () => {
        await expectRole({
          method: 'get',
          url: '/user',
          role,
          expectedStatus: expectedAll,
        });
      });

      const expectedComplete = ['user', 'admin'].includes(role) ? [200,400] : 403;
      it(`${role} → PATCH /user/complete/1 (예상: ${getExpectedText(expectedComplete)})`, async () => {
        await expectRole({
          method: 'patch',
          url: '/user/complete/1',
          role,
          expectedStatus: expectedComplete,
        });
      });

      const expectedEventFilter = ['admin', 'auditor', 'operator'].includes(role) ? 200 : 403;
      it(`${role} → GET /user/event/1 (예상: ${getExpectedText(expectedEventFilter)})`, async () => {
        await expectRole({
          method: 'get',
          url: '/user/event/1',
          role,
          expectedStatus: expectedEventFilter,
        });
      });

      const expectedStatusTrue = ['admin', 'auditor', 'operator'].includes(role) ? 200 : 403;
      it(`${role} → GET /user/status/true (예상: ${getExpectedText(expectedStatusTrue)})`, async () => {
        await expectRole({
          method: 'get',
          url: '/user/status/true',
          role,
          expectedStatus: expectedStatusTrue,
        });
      });

      const expectedStatusFalse = ['admin', 'auditor', 'operator'].includes(role) ? 200 : 403;
      it(`${role} → GET /user/status/false (예상: ${getExpectedText(expectedStatusFalse)})`, async () => {
        await expectRole({
          method: 'get',
          url: '/user/status/false',
          role,
          expectedStatus: expectedStatusFalse,
        });
      });

    }
  });
});
