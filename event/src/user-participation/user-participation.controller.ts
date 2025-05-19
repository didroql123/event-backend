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
  ParseIntPipe,
} from '@nestjs/common';
import { UserParticipationService } from './user-participation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('user')
export class UserParticipationController {
  constructor(private readonly userService: UserParticipationService) {}

  // ✅ [user] 이벤트 참여
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @Post('participate')
  participate(
    @Request() req,
    @Body('event_id', ParseIntPipe) event_id: number,
  ) {
    return this.userService.participate(req.user.email, event_id);
  }

  // ✅ [user] 내 참여 기록 조회
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @Get('me')
  getMyParticipation(@Request() req) {
    return this.userService.getMyParticipation(req.user.email);
  }

  // ✅ [admin, auditor, operator] 전체 유저 참여 내역 조회
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'auditor', 'operator')
  @Get()
  getAll() {
    return this.userService.getAllParticipation();
  }

  // ✅ [user] 미션 완료 처리
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @Patch('complete/:event_id')
  complete(
    @Request() req,
    @Param('event_id', ParseIntPipe) event_id: number,
  ) {
    return this.userService.completeMission(req.user.email, event_id);
  }

  // ✅ [admin] 특정 유저 참여 정보 삭제
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':email/:event_id')
  deleteParticipation(
    @Param('email') email: string,
    @Param('event_id', ParseIntPipe) eventId: number,
  ) {
    return this.userService.deleteParticipation(email, eventId);
  }

  // ✅ [admin, auditor] 특정 이벤트 참여자만 조회
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'auditor', 'operator')
  @Get('event/:event_id')
  getByEventId(@Param('event_id', ParseIntPipe) event_id: number) {
    return this.userService.getByEventId(event_id);
  }

  // ✅ [admin, auditor] 보상 상태별 참여자 조회
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'auditor', 'operator')
  @Get('status/:status')
  getByRewardStatus(@Param('status') status: 'true' | 'false') {
    return this.userService.getByStatus(status === 'true');
  }

}
