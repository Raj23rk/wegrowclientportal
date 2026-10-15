import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  ForbiddenException
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  async getAllClients(@Request() req: any) {
    if (req.user.role === 'admin') {
      return this.clientsService.findAll();
    }
    // Client can only see their own client overview
    if (!req.user.clientId) {
      throw new ForbiddenException('No client ID associated with user');
    }
    const client = await this.clientsService.findByClientId(req.user.clientId);
    return [client];
  }

  @Get(':id')
  async getClientById(@Param('id') id: string, @Request() req: any) {
    // Strict client isolation: non-admins can only access their assigned clientId
    if (req.user.role !== 'admin' && req.user.clientId !== id) {
      throw new ForbiddenException('Access denied: You can only view your own client portal.');
    }
    return this.clientsService.findByClientId(id);
  }

  @Patch(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() patch: any,
    @Request() req: any
  ) {
    if (req.user.role !== 'admin' && req.user.clientId !== id) {
      throw new ForbiddenException('Access denied: You can only update your own profile.');
    }
    // Only allow updating contact fields
    const safePatch = {
      contact: patch.contact,
      contactTitle: patch.contactTitle,
      phone: patch.phone
    };
    return this.clientsService.updateProfile(id, safePatch);
  }
}
