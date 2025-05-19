import { Test, TestingModule } from '@nestjs/testing';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import 'reflect-metadata';

describe('RewardController - 역할 기반 Guard 테스트', () => {
  let controller: RewardController;

  const mockService = {
    create: jest.fn().mockResolvedValue({ message: '보상 생성됨' }),
    findAll: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockResolvedValue({ message: '보상 수정됨' }),
    updateQuantity: jest.fn().mockResolvedValue({ message: '수량 수정됨' }),
    delete: jest.fn().mockResolvedValue({ message: '보상 삭제됨' }),
  };

  const getMockGuard = (allowedRoles: string[], currentRole: string) => ({
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { role: currentRole };
      const handler = context.getHandler();
      const requiredRoles = Reflect.getMetadata('roles', handler);

      if (!requiredRoles || requiredRoles.includes(currentRole)) {
        return true;
      }
      throw new ForbiddenException(`❌ ${currentRole}는 접근 권한 없음`);
    },
  });

  const setup = async (role: string) => {
    const mockGuard = getMockGuard(['admin', 'operator', 'user'], role);

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [RewardController],
      providers: [{ provide: RewardService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockGuard)
      .compile();

    controller = moduleRef.get<RewardController>(RewardController);
  };

  // 🧪 실제 Controller 연결 테스트
  describe('🟢 create()', () => {
    it('✅ admin 허용', async () => {
      await setup('admin');
      const result = await controller.create({});
      expect(result).toEqual({ message: '보상 생성됨' });
    });

    it('❌ user 거부', async () => {
      await setup('user');
      await expect(controller.create({})).rejects.toThrow(ForbiddenException);
    });
  });

  describe('🟢 findAll()', () => {
    it('✅ user 허용', async () => {
      await setup('user');
      const result = await controller.findAll();
      expect(result).toEqual([]);
    });

    it('✅ operator 허용', async () => {
      await setup('operator');
      const result = await controller.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('🟢 update()', () => {
    it('✅ operator 허용', async () => {
      await setup('operator');
      const result = await controller.update(1, {});
      expect(result).toEqual({ message: '보상 수정됨' });
    });

    it('❌ user 거부', async () => {
      await setup('user');
      await expect(controller.update(1, {})).rejects.toThrow(ForbiddenException);
    });
  });

  describe('🟢 delete()', () => {
    it('✅ admin 허용', async () => {
      await setup('admin');
      const result = await controller.delete(1);
      expect(result).toEqual({ message: '보상 삭제됨' });
    });

    it('❌ auditor 거부', async () => {
      await setup('auditor');
      await expect(controller.delete(1)).rejects.toThrow(ForbiddenException);
    });
  });
});
