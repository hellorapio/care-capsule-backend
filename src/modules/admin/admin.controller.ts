//@ts-nocheck
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AdminService } from './admin.service';
import { res } from 'src/utils/utils';
import Roles from 'src/decorators/Roles.decorator';
import RolesGuard from 'src/guards/roles.guard';
import {
  CreateMedicineAdminDto,
  UpdateMedicineAdminDto,
  UpdateUserRoleDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
  CreatePharmacyAdminDto,
  UpdatePharmacyAdminDto,
  BulkUpdateDto,
} from './dtos/admin.dto';

@Controller('admin')
@UseGuards(RolesGuard)
@Roles('admin', 'super-admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Dashboard
  @Get('/dashboard/stats')
  async getDashboardStats() {
    const data = await this.adminService.getDashboardStats();
    return res(data, 'Dashboard statistics retrieved successfully', 200);
  }

  @Get('/dashboard/analytics')
  async getAnalytics() {
    const data = await this.adminService.getOrderAnalytics();
    return res(data, 'Analytics retrieved successfully', 200);
  }

  // User Management
  @Get('/users')
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    const data = await this.adminService.getAllUsers(
      parseInt(page),
      parseInt(limit),
      search,
    );
    return res(data, 'Users retrieved successfully', 200);
  }

  @Patch('/users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body('role') role: string) {
    const data = await this.adminService.updateUserRole(id, role);
    return res(data, 'User role updated successfully', 200);
  }

  @Delete('/users/:id')
  async deleteUser(@Param('id') id: string) {
    const data = await this.adminService.deleteUser(id);
    return res(data, 'User deleted successfully', 200);
  }

  // Medicine Management
  @Get('/medicines')
  async getAllMedicines(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    const data = await this.adminService.getAllMedicinesAdmin(
      parseInt(page),
      parseInt(limit),
      search,
      category,
    );
    return res(data, 'Medicines retrieved successfully', 200);
  }
  @Post('/medicines')
  async createMedicine(@Body() createMedicineDto: CreateMedicineAdminDto) {
    const data = await this.adminService.createMedicine(createMedicineDto);
    return res(data, 'Medicine created successfully', 201);
  }

  @Patch('/medicines/:id')
  async updateMedicine(
    @Param('id') id: string,
    @Body() updateMedicineDto: UpdateMedicineAdminDto,
  ) {
    const data = await this.adminService.updateMedicine(id, updateMedicineDto);
    return res(data, 'Medicine updated successfully', 200);
  }

  @Delete('/medicines/:id')
  async deleteMedicine(@Param('id') id: string) {
    const data = await this.adminService.deleteMedicine(id);
    return res(data, 'Medicine deleted successfully', 200);
  }
  @Patch('/medicines/:id/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async updateMedicineImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const data = await this.adminService.updateMedicineImage(id, file);
    return res(data, 'Medicine image updated successfully', 200);
  }

  // Order Management
  @Get('/orders')
  async getAllOrders(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('paymentStatus') paymentStatus?: string,
  ) {
    const data = await this.adminService.getAllOrders(
      parseInt(page),
      parseInt(limit),
      status,
      paymentStatus,
    );
    return res(data, 'Orders retrieved successfully', 200);
  }

  @Patch('/orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const data = await this.adminService.updateOrderStatus(id, status);
    return res(data, 'Order status updated successfully', 200);
  }

  @Patch('/orders/:id/payment-status')
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body('paymentStatus') paymentStatus: string,
  ) {
    const data = await this.adminService.updatePaymentStatus(id, paymentStatus);
    return res(data, 'Payment status updated successfully', 200);
  }

  // Review Management
  @Get('/reviews')
  async getAllReviews(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('pharmacyId') pharmacyId?: string,
  ) {
    const data = await this.adminService.getAllReviews(
      parseInt(page),
      parseInt(limit),
      pharmacyId,
    );
    return res(data, 'Reviews retrieved successfully', 200);
  }

  @Delete('/reviews/:id')
  async deleteReview(@Param('id') id: string) {
    const data = await this.adminService.deleteReview(id);
    return res(data, 'Review deleted successfully', 200);
  }

  // Pharmacy Management
  @Get('/pharmacies')
  async getAllPharmacies(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const isActiveBoolean =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    const data = await this.adminService.getAllPharmaciesAdmin(
      parseInt(page),
      parseInt(limit),
      search,
      isActiveBoolean,
    );
    return res(data, 'Pharmacies retrieved successfully', 200);
  }

  @Patch('/pharmacies/:id/toggle-status')
  async togglePharmacyStatus(@Param('id') id: string) {
    const data = await this.adminService.togglePharmacyStatus(id);
    return res(data, 'Pharmacy status toggled successfully', 200);
  }

  // Search functionality
  @Get('/search/medicines')
  async searchMedicines(
    @Query('q') query: string,
    @Query('category') category?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const data = await this.adminService.getAllMedicinesAdmin(
      parseInt(page),
      parseInt(limit),
      query,
      category,
    );
    return res(data, 'Search results retrieved successfully', 200);
  }

  @Get('/search/users')
  async searchUsers(
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const data = await this.adminService.getAllUsers(
      parseInt(page),
      parseInt(limit),
      query,
    );
    return res(data, 'Search results retrieved successfully', 200);
  }

  @Get('/search/pharmacies')
  async searchPharmacies(
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const data = await this.adminService.getAllPharmaciesAdmin(
      parseInt(page),
      parseInt(limit),
      query,
    );
    return res(data, 'Search results retrieved successfully', 200);
  }

  // Advanced Analytics and Reports
  @Get('/reports/users')
  async getUsersReport() {
    const data = await this.adminService.getUsersReport();
    return res(data, 'Users report retrieved successfully', 200);
  }

  @Get('/reports/revenue')
  async getRevenueReport(
    @Query('period') period: string = 'month', // month, week, year
  ) {
    const data = await this.adminService.getRevenueReport(period);
    return res(data, 'Revenue report retrieved successfully', 200);
  }

  @Get('/reports/medicines')
  async getMedicinesReport() {
    const data = await this.adminService.getMedicinesReport();
    return res(data, 'Medicines report retrieved successfully', 200);
  }

  @Get('/reports/pharmacies')
  async getPharmaciesReport() {
    const data = await this.adminService.getPharmaciesReport();
    return res(data, 'Pharmacies report retrieved successfully', 200);
  }

  // Bulk Operations
  @Post('/bulk/users/activate')
  async bulkActivateUsers(@Body('userIds') userIds: string[]) {
    const data = await this.adminService.bulkUpdateUsers(userIds, {
      role: 'user',
    });
    return res(data, 'Users activated successfully', 200);
  }

  @Post('/bulk/medicines/update-category')
  async bulkUpdateMedicineCategory(
    @Body('medicineIds') medicineIds: string[],
    @Body('category') category: string,
  ) {
    const data = await this.adminService.bulkUpdateMedicines(medicineIds, {
      category,
    });
    return res(data, 'Medicines category updated successfully', 200);
  }

  @Post('/bulk/pharmacies/activate')
  async bulkActivatePharmacies(@Body('pharmacyIds') pharmacyIds: string[]) {
    const data = await this.adminService.bulkUpdatePharmacies(pharmacyIds, {
      isActive: true,
    });
    return res(data, 'Pharmacies activated successfully', 200);
  }

  @Post('/bulk/pharmacies/deactivate')
  async bulkDeactivatePharmacies(@Body('pharmacyIds') pharmacyIds: string[]) {
    const data = await this.adminService.bulkUpdatePharmacies(pharmacyIds, {
      isActive: false,
    });
    return res(data, 'Pharmacies deactivated successfully', 200);
  }

  // Detailed Views
  @Get('/users/:id')
  async getUserDetails(@Param('id') id: string) {
    const data = await this.adminService.getUserDetails(id);
    return res(data, 'User details retrieved successfully', 200);
  }

  @Get('/orders/:id/details')
  async getOrderDetails(@Param('id') id: string) {
    const data = await this.adminService.getOrderDetails(id);
    return res(data, 'Order details retrieved successfully', 200);
  }

  @Get('/pharmacies/:id/medicines')
  async getPharmacyMedicines(@Param('id') id: string) {
    const data = await this.adminService.getPharmacyMedicines(id);
    return res(data, 'Pharmacy medicines retrieved successfully', 200);
  }

  @Get('/pharmacies/:id/reviews')
  async getPharmacyReviews(
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const data = await this.adminService.getAllReviews(
      parseInt(page),
      parseInt(limit),
      id,
    );
    return res(data, 'Pharmacy reviews retrieved successfully', 200);
  }
  // Content Management
  @Post('/pharmacies')
  async createPharmacy(@Body() createPharmacyDto: CreatePharmacyAdminDto) {
    const data = await this.adminService.createPharmacy(createPharmacyDto);
    return res(data, 'Pharmacy created successfully', 201);
  }

  @Patch('/pharmacies/:id')
  async updatePharmacy(
    @Param('id') id: string,
    @Body() updatePharmacyDto: UpdatePharmacyAdminDto,
  ) {
    const data = await this.adminService.updatePharmacy(id, updatePharmacyDto);
    return res(data, 'Pharmacy updated successfully', 200);
  }

  @Delete('/pharmacies/:id')
  async deletePharmacy(@Param('id') id: string) {
    const data = await this.adminService.deletePharmacy(id);
    return res(data, 'Pharmacy deleted successfully', 200);
  }

  // System Configuration
  @Get('/config/categories')
  async getMedicineCategories() {
    const data = await this.adminService.getMedicineCategories();
    return res(data, 'Medicine categories retrieved successfully', 200);
  }
  @Get('/config/order-statuses')
  getOrderStatuses() {
    const data = this.adminService.getOrderStatuses();
    return res(data, 'Order statuses retrieved successfully', 200);
  }
}
