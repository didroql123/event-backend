import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

describe('UserService', () => {
  let service: UserService;

  const mockUserModel: any = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue(data),
  }));

  mockUserModel.findOne = jest.fn();
  mockUserModel.create = jest.fn();

  const mockJwtService = {
    sign: jest.fn(() => 'mocked.jwt.token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: 'UserModel', useValue: mockUserModel },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    mockUserModel.findOne.mockReset();
    mockUserModel.create.mockReset();
  });

  it('회원가입 시 중복 이메일이면 에러 발생', async () => {
    mockUserModel.findOne.mockResolvedValueOnce({ email: 'test@test.com' });
    await expect(service.create('test@test.com', '1234', 'user')).rejects.toThrow(ConflictException);
  });

  it('회원가입 성공 시 비밀번호는 해싱되어야 함', async () => {
    mockUserModel.findOne.mockResolvedValueOnce(null);
    const result = await service.create('test2@test.com', '1234', 'user');
    const isHashed = await bcrypt.compare('1234', result.password);
    expect(isHashed).toBe(true);
  });

  it('로그인 성공 시 JWT 토큰 반환', async () => {
    const hashed = await bcrypt.hash('1234', 10);
    mockUserModel.findOne.mockResolvedValueOnce({
      email: 'test@test.com',
      password: hashed,
      role: 'user',
      toObject: function () {
        return {
          email: this.email,
          password: this.password,
          role: this.role,
        };
      },
    });

    const result = await service.login('test@test.com', '1234');
    expect(result.token).toBe('mocked.jwt.token');
  });

  it('비밀번호 틀리면 UnauthorizedException 발생', async () => {
    const hashed = await bcrypt.hash('abcd', 10);
    mockUserModel.findOne.mockResolvedValueOnce({
      email: 'test@test.com',
      password: hashed,
      role: 'user',
      toObject: function () {
        return {
          email: this.email,
          password: this.password,
          role: this.role,
        };
      },
    });

    await expect(service.login('test@test.com', 'wrongpw')).rejects.toThrow(UnauthorizedException);
  });
});
