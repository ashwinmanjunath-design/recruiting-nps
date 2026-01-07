import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { UserRole } from '../../../shared/types/enums';
import type { LoginResponse, AuthUser } from '../../../shared/types/api/auth.types';

const prisma = new PrismaClient();

class AuthService {
  /**
   * Login user and generate tokens
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('User account is inactive');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const { token, refreshToken } = await this.generateTokens(user);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole
      }
    };
  }

  /**
   * Register new user
   */
  async register(data: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
    invitedBy?: string;
  }): Promise<LoginResponse> {
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role || UserRole.VIEWER,
        invitedBy: data.invitedBy,
        invitedAt: data.invitedBy ? new Date() : undefined
      }
    });

    // Generate tokens
    const { token, refreshToken } = await this.generateTokens(user);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole
      }
    };
  }

  /**
   * Refresh access token
   */
  async refresh(refreshTokenString: string): Promise<{ token: string; refreshToken: string }> {
    // Find refresh token
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenString },
      include: { user: true }
    });

    if (!refreshToken) {
      throw new Error('Invalid refresh token');
    }

    // Check expiration
    if (refreshToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: refreshToken.id } });
      throw new Error('Refresh token expired');
    }

    // Delete old refresh token
    await prisma.refreshToken.delete({ where: { id: refreshToken.id } });

    // Generate new tokens
    return await this.generateTokens(refreshToken.user);
  }

  /**
   * Logout user
   */
  async logout(refreshTokenString: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshTokenString }
    });
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(user: any): Promise<{ token: string; refreshToken: string }> {
    const jwtSecret = process.env.JWT_SECRET || 'secret';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

    // Access token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

    // Refresh token
    const refreshTokenString = nanoid(64);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await prisma.refreshToken.create({
      data: {
        token: refreshTokenString,
        userId: user.id,
        expiresAt
      }
    });

    return { token, refreshToken: refreshTokenString };
  }

  /**
   * Verify token
   */
  async verifyToken(token: string): Promise<AuthUser> {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret'
      ) as any;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

export default new AuthService();

