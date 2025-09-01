import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersAdminController } from './users.admin.controller';
import { UsersController } from './users.controller'; // <-- เพิ่ม import

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersAdminController, UsersController], // <-- เพิ่ม UsersController
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}