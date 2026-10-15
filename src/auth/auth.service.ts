import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

export const DEMO_USERS = [
  {
    email: 'arjun@meridianfoods.in',
    clientId: 'C001',
    password: 'demo123',
    role: 'client',
    name: 'Arjun Mehta',
    title: 'Managing Director'
  },
  {
    email: 'lakshmi@kaveritextiles.in',
    clientId: 'C002',
    password: 'demo123',
    role: 'client',
    name: 'Lakshmi Sundar',
    title: 'Chief Executive'
  },
  {
    email: 'admin@wegrow.in',
    clientId: null,
    password: 'admin123',
    role: 'admin',
    name: 'Dr. Thavabalan',
    title: 'Lead Consultant, WeGrow'
  }
];

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService
  ) {}

  async validateUser(identifier: string, pass: string): Promise<any> {
    const cleanId = identifier.trim().toLowerCase();

    // Check database if available
    try {
      const user = await this.userModel.findOne({
        $or: [{ email: cleanId }, { clientId: cleanId.toUpperCase() }]
      });
      if (user && user.passwordHash === pass) {
        return {
          email: user.email,
          clientId: user.clientId,
          role: user.role,
          name: user.name,
          title: user.title
        };
      }
    } catch (err) {
      // Database might be bootstrapping or not connected; fall back to demo accounts
    }

    // Match with built-in demo credentials
    const demo = DEMO_USERS.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        (u.clientId && u.clientId.toLowerCase() === cleanId)
    );

    if (demo && demo.password === pass) {
      return {
        email: demo.email,
        clientId: demo.clientId,
        role: demo.role,
        name: demo.name,
        title: demo.title
      };
    }

    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      clientId: user.clientId,
      role: user.role,
      name: user.name,
      title: user.title
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: payload
    };
  }
}
