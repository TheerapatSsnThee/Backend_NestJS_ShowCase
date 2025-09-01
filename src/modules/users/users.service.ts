import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

export type CreateUserDto = Omit<User, 'id' | 'created_at' | 'updated_at' | 'address' | 'phone_number'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  //--- Auth Functions ---

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const newUser = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(newUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async findOneById(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  //--- User Profile Functions ---

  async updateProfile(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Omit<User, 'password_hash'>> {
    const user = await this.usersRepository.preload({
      id: userId,
      ...updateProfileDto,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const updatedUser = await this.usersRepository.save(user);
    const { password_hash, ...result } = updatedUser;
    return result;
  }


  //--- Admin Functions ---

  async findAll(options: {
    page: number;
    limit: number;
  }): Promise<{ data: Omit<User, 'password_hash'>[]; total: number }> {
    const { page, limit } = options;
    const [data, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });

    const usersWithoutPassword = data.map(({ password_hash, ...user }) => user);
    return { data: usersWithoutPassword, total };
  }

  async updateRole(
    userId: number,
    role: UserRole,
  ): Promise<Omit<User, 'password_hash'>> {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    user.role = role;
    const updatedUser = await this.usersRepository.save(user);

    const { password_hash, ...result } = updatedUser;
    return result;
  }
}
