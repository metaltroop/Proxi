"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = exports.requestLogger = void 0;
const logger_1 = __importDefault(require("../config/logger"));
// List of sensitive fields to sanitize
const SENSITIVE_FIELDS = ['password', 'token', 'accessToken', 'refreshToken', 'authorization'];
// Sanitize sensitive data from objects
const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object')
        return obj;
    const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };
    for (const key in sanitized) {
        if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field))) {
            sanitized[key] = '***REDACTED***';
        }
        else if (typeof sanitized[key] === 'object') {
            sanitized[key] = sanitize(sanitized[key]);
        }
    }
    return sanitized;
};
// Logging middleware
const requestLogger = (req, res, next) => {
    // Record start time
    req.startTime = Date.now();
    // Log request
    const requestLog = {
        method: req.method,
        url: req.originalUrl || req.url,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
        userId: req.user?.id || 'anonymous',
    };
    logger_1.default.info('Incoming request', requestLog);
    // Capture the original end function
    const originalEnd = res.end;
    // Override res.end to log response
    res.end = function (chunk, encoding, callback) {
        // Calculate duration
        const duration = req.startTime ? Date.now() - req.startTime : 0;
        // Log response
        const responseLog = {
            method: req.method,
            url: req.originalUrl || req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.socket.remoteAddress,
            userId: req.user?.id || 'anonymous',
        };
        // Log based on status code
        if (res.statusCode >= 500) {
            logger_1.default.error('Server error response', responseLog);
        }
        else if (res.statusCode >= 400) {
            logger_1.default.warn('Client error response', responseLog);
        }
        else {
            logger_1.default.info('Successful response', responseLog);
        }
        // Call the original end function
        return originalEnd.call(this, chunk, encoding, callback);
    };
    next();
};
exports.requestLogger = requestLogger;
// Error logging middleware
const errorLogger = (err, req, res, next) => {
    const errorLog = {
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl || req.url,
        ip: req.ip || req.socket.remoteAddress,
        userId: req.user?.id || 'anonymous',
        body: sanitize(req.body),
        query: sanitize(req.query),
        params: sanitize(req.params),
    };
    logger_1.default.error('Application error', errorLog);
    next(err);
};
exports.errorLogger = errorLogger;
exports.default = { requestLogger: exports.requestLogger, errorLogger: exports.errorLogger };
//# sourceMappingURL=logger.middleware.js.map