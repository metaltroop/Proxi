import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

// Extend Express Request to include startTime
interface RequestWithTiming extends Request {
    startTime?: number;
}

// List of sensitive fields to sanitize
const SENSITIVE_FIELDS = ['password', 'token', 'accessToken', 'refreshToken', 'authorization'];

// Sanitize sensitive data from objects
const sanitize = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };

    for (const key in sanitized) {
        if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field))) {
            sanitized[key] = '***REDACTED***';
        } else if (typeof sanitized[key] === 'object') {
            sanitized[key] = sanitize(sanitized[key]);
        }
    }

    return sanitized;
};

// Logging middleware
export const requestLogger = (req: RequestWithTiming, res: Response, next: NextFunction) => {
    // Record start time
    req.startTime = Date.now();

    // Log request
    const requestLog = {
        method: req.method,
        url: req.originalUrl || req.url,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
        userId: (req as any).user?.id || 'anonymous',
    };

    logger.info('Incoming request', requestLog);

    // Capture the original end function
    const originalEnd = res.end;

    // Override res.end to log response
    res.end = function (chunk?: any, encoding?: any, callback?: any): any {
        // Calculate duration
        const duration = req.startTime ? Date.now() - req.startTime : 0;

        // Log response
        const responseLog = {
            method: req.method,
            url: req.originalUrl || req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.socket.remoteAddress,
            userId: (req as any).user?.id || 'anonymous',
        };

        // Log based on status code
        if (res.statusCode >= 500) {
            logger.error('Server error response', responseLog);
        } else if (res.statusCode >= 400) {
            logger.warn('Client error response', responseLog);
        } else {
            logger.info('Successful response', responseLog);
        }

        // Call the original end function
        return originalEnd.call(this, chunk, encoding, callback);
    };

    next();
};

// Error logging middleware
export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction) => {
    const errorLog = {
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl || req.url,
        ip: req.ip || req.socket.remoteAddress,
        userId: (req as any).user?.id || 'anonymous',
        body: sanitize(req.body),
        query: sanitize(req.query),
        params: sanitize(req.params),
    };

    logger.error('Application error', errorLog);

    next(err);
};

export default { requestLogger, errorLogger };
