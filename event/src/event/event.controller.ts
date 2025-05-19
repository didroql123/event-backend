import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { EventService } from './event.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Post()
  create(@Body() body: any) {
    return this.eventService.create(body);
  }

  @Get()
  findFiltered(@Query('valid') valid: 'true' | 'false' | 'all') {
    return this.eventService.findFiltered(valid);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.eventService.findOne(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Patch(':event_id')
  update(@Param('event_id') event_id: number, @Body() body: any) {
    return this.eventService.update(event_id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('operator', 'admin')
  @Delete(':event_id')
  delete(@Param('event_id') event_id: number) {
    return this.eventService.delete(event_id);
  }

  

}
