import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-codes';

// ─── Response shape ───────────────────────────────────────────────────────────

export interface ErrorResponse {
  success: false;
  code: ErrorCode;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  details?: Record<string, unknown>;
}

// ─── Base exception ───────────────────────────────────────────────────────────

/**
 * All application exceptions extend this class.
 * It carries a typed error code in addition to the HTTP status,
 * so consumers can switch on `code` rather than on status numbers.
 */
export class AppException extends HttpException {
  readonly code: ErrorCode;
  readonly details: Record<string, unknown> | undefined;

  constructor(
    code: ErrorCode,
    message: string,
    status: HttpStatus,
    details?: Record<string, unknown>,
  ) {
    super({ success: false, code, message, statusCode: status, details }, status);
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── 400 Bad Request ─────────────────────────────────────────────────────────

export class ValidationException extends AppException {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.VALIDATION_ERROR, message, HttpStatus.BAD_REQUEST, details);
  }
}

// ─── 401 Unauthorized ────────────────────────────────────────────────────────

export class UnauthorizedException extends AppException {
  constructor(code: ErrorCode, message: string) {
    super(code, message, HttpStatus.UNAUTHORIZED);
  }
}

export class TokenMissingException extends UnauthorizedException {
  constructor() { super(ErrorCode.AUTH_TOKEN_MISSING, 'Token de autenticação não fornecido'); }
}

export class TokenInvalidException extends UnauthorizedException {
  constructor() { super(ErrorCode.AUTH_TOKEN_INVALID, 'Token inválido'); }
}

export class TokenExpiredException extends UnauthorizedException {
  constructor() { super(ErrorCode.AUTH_TOKEN_EXPIRED, 'Token expirado'); }
}

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() { super(ErrorCode.AUTH_INVALID_CREDENTIALS, 'Credenciais inválidas'); }
}

export class EmailNotVerifiedException extends UnauthorizedException {
  constructor() {
    super(ErrorCode.AUTH_EMAIL_NOT_VERIFIED, 'Confirme seu email antes de continuar');
  }
}

// ─── 403 Forbidden ───────────────────────────────────────────────────────────

export class ForbiddenException extends AppException {
  constructor(message = 'Acesso não permitido') {
    super(ErrorCode.ADMIN_FORBIDDEN, message, HttpStatus.FORBIDDEN);
  }
}

// ─── 404 Not Found ───────────────────────────────────────────────────────────

export class NotFoundException extends AppException {
  constructor(code: ErrorCode, resource: string) {
    super(code, `${resource} não encontrado(a)`, HttpStatus.NOT_FOUND);
  }
}

export class UserNotFoundException extends NotFoundException {
  constructor() { super(ErrorCode.USER_NOT_FOUND, 'Usuário'); }
}

export class UserProfileNotFoundException extends NotFoundException {
  constructor() { super(ErrorCode.USER_PROFILE_NOT_FOUND, 'Perfil de usuário'); }
}

export class ProductNotFoundException extends NotFoundException {
  constructor() { super(ErrorCode.PRODUCT_NOT_FOUND, 'Produto'); }
}

export class CategoryNotFoundException extends NotFoundException {
  constructor() { super(ErrorCode.CATEGORY_NOT_FOUND, 'Categoria'); }
}

export class FileNotFoundException extends NotFoundException {
  constructor() { super(ErrorCode.FILE_NOT_FOUND, 'Arquivo'); }
}

// ─── 409 Conflict ────────────────────────────────────────────────────────────

export class ConflictException extends AppException {
  constructor(code: ErrorCode, message: string) {
    super(code, message, HttpStatus.CONFLICT);
  }
}

export class UserAlreadyExistsException extends ConflictException {
  constructor() { super(ErrorCode.USER_ALREADY_EXISTS, 'Email já está em uso'); }
}

export class ProductSlugConflictException extends ConflictException {
  constructor(slug: string) {
    super(ErrorCode.PRODUCT_SLUG_CONFLICT, `Slug "${slug}" já está em uso`);
  }
}

export class CategorySlugConflictException extends ConflictException {
  constructor(slug: string) {
    super(ErrorCode.CATEGORY_SLUG_CONFLICT, `Slug "${slug}" já está em uso`);
  }
}

export class CategoryHasChildrenException extends ConflictException {
  constructor() {
    super(ErrorCode.CATEGORY_HAS_CHILDREN, 'Não é possível deletar categoria com subcategorias');
  }
}

// ─── 429 Too Many Requests ───────────────────────────────────────────────────

export class RateLimitException extends AppException {
  constructor(message: string, retryAfterSeconds?: number) {
    super(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      message,
      HttpStatus.TOO_MANY_REQUESTS,
      retryAfterSeconds ? { retryAfterSeconds } : undefined,
    );
  }
}

// ─── 503 Service Unavailable ─────────────────────────────────────────────────

export class ServiceUnavailableException extends AppException {
  constructor(serviceName: string) {
    super(
      ErrorCode.SERVICE_UNAVAILABLE,
      `Serviço ${serviceName} está temporariamente indisponível`,
      HttpStatus.SERVICE_UNAVAILABLE,
      { serviceName },
    );
  }
}

export class ServiceTimeoutException extends AppException {
  constructor(serviceName: string, timeoutMs: number) {
    super(
      ErrorCode.SERVICE_TIMEOUT,
      `Serviço ${serviceName} não respondeu dentro do tempo limite`,
      HttpStatus.GATEWAY_TIMEOUT,
      { serviceName, timeoutMs },
    );
  }
}