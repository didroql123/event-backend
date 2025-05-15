import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async create(email: string, password: string, role: string): Promise<User> {
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({ email, password: hashed, role });
    return newUser.save();
  }

   async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...rest } = user.toObject();
      return rest;
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다');

    const payload = { sub: user._id, email: user.email, role: user.role};
    const token = this.jwtService.sign(payload);

    return {
      message: '로그인 성공',
      token,
    };
  }

}
