import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Public, Roles } from 'common';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'admin-service', timestamp: new Date().toISOString() };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('SUPER_ADMINISTRADOR')
  create(@Body() dto: CreateAdminDto) {
    return this.adminService.create(dto);
  }

  @Get()
  @Roles('SUPER_ADMINISTRADOR')
  findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  @Roles('SUPER_ADMINISTRADOR')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMINISTRADOR')
  update(@Param('id') id: string, @Body() dto: UpdateAdminDto) {
    return this.adminService.update(id, dto);
  }

  @Patch(':id/activate')
  @Roles('SUPER_ADMINISTRADOR')
  activate(@Param('id') id: string) {
    return this.adminService.activate(id);
  }

  @Patch(':id/deactivate')
  @Roles('SUPER_ADMINISTRADOR')
  deactivate(@Param('id') id: string) {
    return this.adminService.deactivate(id);
  }
}
