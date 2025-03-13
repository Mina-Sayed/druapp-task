import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Create user with the password provided by the auth service (already hashed)
    const user = this.usersRepository.create(createUserDto);

    return this.usersRepository.save(user);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user;
  }

  async enableMfa(userId: string, secret: string): Promise<User> {
    const user = await this.findOne(userId);
    user.mfaSecret = secret;
    user.mfaEnabled = true;
    return this.usersRepository.save(user);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      updatedAt: new Date(),
    });
  }

  /**
   * Update user profile
   */
  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, updateData);
    return this.findOne(id);
  }

  /**
   * Set temporary MFA secret during setup
   */
  async setTempMfaSecret(id: string, secret: string): Promise<User> {
    await this.usersRepository.update(id, { tempMfaSecret: secret });
    return this.findOne(id);
  }

  /**
   * Disable MFA for user
   */
  async disableMfa(id: string): Promise<User> {
    await this.usersRepository.update(id, {
      mfaEnabled: false,
      mfaSecret: null,
      tempMfaSecret: null,
    });
    return this.findOne(id);
  }

  /**
   * Get all users (for admin purposes)
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  /**
   * Get all doctors
   */
  async findAllDoctors(): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: UserRole.DOCTOR },
      select: ['id', 'name', 'email', 'specialization', 'bio', 'image'],
    });
  }

  async findDoctorsBySpecialization(specialization: string): Promise<User[]> {
    return this.usersRepository.find({
      where: {
        role: UserRole.DOCTOR,
        specialization,
      },
      select: ['id', 'name', 'email', 'specialization', 'bio', 'image'],
    });
  }
}
