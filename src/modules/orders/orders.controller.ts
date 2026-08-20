import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam, ApiProduces } from '@nestjs/swagger';
import type { Response } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateOrderDetailsDto } from './dto/update-order-details.dto';
import { RequestRevisionDto } from './dto/request-revision.dto';
import { CreateAdminRevisionDto } from './dto/create-admin-revision.dto';
import { RespondRevisionDto } from './dto/respond-revision.dto';
import { UpdateOrderPriorityDto } from './dto/update-order-priority.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import type { Request } from 'express';
import type { AuthUser } from '../../types/auth.types';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Ambil semua order (admin) atau order milik sendiri (client)' })
  @ApiResponse({ status: 200, description: 'Daftar order' })
  findAll(@Req() req: Request) {
    const user = req.user as AuthUser;
    if (user.role === 'admin') return this.ordersService.findAll();
    return this.ordersService.findByClient(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Ambil detail order beserta payments dan progress' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Detail order' })
  @ApiResponse({ status: 403, description: 'Bukan pemilik order' })
  @ApiResponse({ status: 404, description: 'Order tidak ditemukan' })
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthUser;
    return this.ordersService.findDetail(id, user);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat order baru (Admin atau Client)' })
  @ApiResponse({ status: 201, description: 'Order berhasil dibuat' })
  create(@Body() dto: CreateOrderDto, @Req() req: Request) {
    const user = req.user as AuthUser;
    // Client: clientId otomatis dari JWT; Admin: bisa tentukan clientId sendiri
    if (user.role !== 'admin') {
      dto.clientId = user.id;
    }
    return this.ordersService.create(dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus order beserta semua data terkait (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 204, description: 'Order berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Order tidak ditemukan' })
  delete(@Param('id') id: string) {
    return this.ordersService.delete(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Update status order (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Status order berhasil diupdate' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }

  @Patch(':id/priority')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Update prioritas order (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Prioritas order berhasil diupdate' })
  @ApiResponse({ status: 404, description: 'Order tidak ditemukan' })
  updatePriority(@Param('id') id: string, @Body() dto: UpdateOrderPriorityDto) {
    return this.ordersService.updatePriority(id, dto);
  }

  @Patch(':id/details')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Update harga, deadline, deskripsi order (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Detail order berhasil diupdate' })
  updateDetails(@Param('id') id: string, @Body() dto: UpdateOrderDetailsDto) {
    return this.ordersService.updateDetails(id, dto);
  }

  @Patch(':id/request-revision')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Minta revisi order oleh client (hanya saat status testing)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Permintaan revisi berhasil dikirim' })
  @ApiResponse({ status: 400, description: 'Status order bukan testing' })
  @ApiResponse({ status: 403, description: 'Bukan pemilik order' })
  requestRevision(@Param('id') id: string, @Body() dto: RequestRevisionDto, @Req() req: Request) {
    const user = req.user as AuthUser;
    return this.ordersService.requestRevision(id, user.id, dto);
  }

  @Post(':id/revisions')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat permintaan revisi baru oleh admin (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 201, description: 'Revisi berhasil dibuat dan status order menjadi "revision"' })
  @ApiResponse({ status: 400, description: 'Order sudah completed/canceled' })
  @ApiResponse({ status: 404, description: 'Order tidak ditemukan' })
  createAdminRevision(@Param('id') id: string, @Body() dto: CreateAdminRevisionDto) {
    return this.ordersService.createAdminRevision(id, dto);
  }

  @Patch(':id/revisions/:revisionId/respond')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Balas revisi dengan catatan & bukti gambar (Admin only)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiParam({ name: 'revisionId', type: 'string' })
  @ApiResponse({ status: 200, description: 'Balasan revisi berhasil disimpan' })
  @ApiResponse({ status: 404, description: 'Order atau revisi tidak ditemukan' })
  respondRevision(@Param('id') id: string, @Param('revisionId') revisionId: string, @Body() dto: RespondRevisionDto) {
    return this.ordersService.respondToRevision(id, revisionId, dto);
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Selesaikan order oleh client (hanya pemilik order)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Order berhasil diselesaikan' })
  @ApiResponse({ status: 403, description: 'Bukan pemilik order' })
  @ApiResponse({ status: 400, description: 'Status order tidak memungkinkan untuk diselesaikan' })
  completeOrder(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthUser;
    return this.ordersService.completeByClient(id, user.id, user.role);
  }

  @Get(':id/invoice')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiProduces('application/pdf')
  @ApiOperation({ summary: 'Unduh invoice PDF order (pemilik order atau admin)' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Berkas PDF invoice' })
  @ApiResponse({ status: 403, description: 'Bukan pemilik order' })
  @ApiResponse({ status: 404, description: 'Order tidak ditemukan' })
  async downloadInvoice(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    const user = req.user as AuthUser;
    const pdf = await this.ordersService.generateInvoicePdf(id, user);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
    });
    res.send(pdf);
  }
}
