import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  domain?: string;
  path?: string;
}

export const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

@Injectable()
export class UtilsService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Valide un token JWT
   */
  verifyToken(token: string, options?: { secret?: string }): any {
    return this.jwtService.verify(token, {
      secret: options?.secret ?? process.env.JWT_SECRET,
    });
  }

  /**
   * Décode un token JWT sans le vérifier
   */
  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }

  /**
   * Définit un cookie d'authentification
   */
  setAuthCookie(
    response: Response, 
    token: string, 
    options: CookieOptions = DEFAULT_COOKIE_OPTIONS,
  ): void {
    response.cookie('access_token', token, options);
  }

  /**
   * Supprime un cookie d'authentification
   */
  clearAuthCookie(
    response: Response, 
    options: Partial<CookieOptions> = { path: '/' },
  ): void {
    response.clearCookie('access_token', options);
  }
}