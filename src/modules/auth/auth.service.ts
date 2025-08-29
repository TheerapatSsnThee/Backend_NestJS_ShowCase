import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(
    registerUserDto: RegisterUserDto,
  ): Promise<Omit<User, 'password_hash'>> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(registerUserDto.password, salt);

    try {
      const user = await this.usersService.create({
        email: registerUserDto.email,
        first_name: registerUserDto.first_name,
        last_name: registerUserDto.last_name,
        password_hash: hashedPassword,
        role: UserRole.USER,
      });

      // --- 🛠️ แก้ไขส่วนนี้ ---
      const { password_hash, ...result } = user;
      return result;
      // --- สิ้นสุดส่วนแก้ไข ---

    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

// src/modules/auth/auth.service.ts

async login(user: any) {
  const payload = { email: user.email, sub: user.id, role: user.role };
  
  // สร้าง object ที่จะส่งกลับไปให้ Frontend
  const loginResponse = {
    access_token: this.jwtService.sign(payload),
    user: user // <-- เพิ่ม user object เข้าไปตรงนี้
  };

  return loginResponse;
  }
}