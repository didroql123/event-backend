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

  @Get()
  findAll() {
    return this.rewardService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.rewardService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'operator', 'admin')
  @Patch(':id/quantity')
  updateQuantity(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.rewardService.updateQuantity(id, quantity);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.rewardService.delete(id);
  }
}
