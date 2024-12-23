import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt'; // You can adjust this if you're using another authentication method
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const token = authHeader.split(' ')[1]; // Expecting Bearer <token>

    try {
      // Verify the JWT token
      const decoded = this.jwtService.verify(token);
      request.user = decoded; // Attach the decoded token payload to the request

      // Check if the user has a "user" or "admin" role
      if (
        request.user &&
        request.user.roles &&
        (request.user.roles.includes('user') ||
          request.user.roles.includes('admin'))
      ) {
        return true; // Grant access if the user has a valid role
      } else {
        throw new UnauthorizedException(
          'Access restricted to authorized users',
        );
      }
    } catch (error) {
      throw new UnauthorizedException(
        `Invalid or expired token: ${error.message}`,
      );
    }
  }
}
