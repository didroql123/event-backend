import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Request,
  UseGuards,
  Param,
} from '@nestjs/common';
import { UserParticipationService } from './user-participation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('user')
export class UserParticipationController {
  constructor(private readonly userService: UserParticipationService) {}

  // 🟢 유저가 이벤트 참여
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Post('participate')
  participate(@Request() req, @Body() body: any) {
    return this.userService.participate(req.user.email, {
      ...body,
      date: new Date(),
      status: false,
    });
  }

  // 🟢 자신의 참여 정보 조회
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Get('me')
  getMy(@Request() req) {
    return this.userService.getMyParticipation(req.user.email);
  }

  // 🟡 자신의 참여 기록 수정 (parti_id 전체 수정)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user')
  @Patch('me')
  updateMy(@Request() req, @Body() body: { parti_id: any[] }) {
    return this.userService.updateMyParticipation(req.user.email, body.parti_id);
  }

  // 🔴 관리자 전체 조회
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'auditor')
  @Get()
  getAll() {
    return this.userService.getAll();
  }

  // 🔴 관리자 삭제
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':email')
  delete(@Param('email') email: string) {
    return this.userService.delete(email);
  }
}
