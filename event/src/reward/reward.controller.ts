import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { RewardService } from './reward.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reward')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Post()
  create(@Body() body: any) {
    return this.rewardService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Get()
  findAll() {
    return this.rewardService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Patch(':reward_id')
  update(@Param('reward_id') reward_id: number, @Body() body: any) {
    return this.rewardService.update(reward_id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Delete(':reward_id')
  delete(@Param('reward_id') reward_id: number) {
    return this.rewardService.delete(reward_id);
  }
}
