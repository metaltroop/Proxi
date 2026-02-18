import { Request, Response, NextFunction } from 'express';
interface RequestWithTiming extends Request {
    startTime?: number;
}
export declare const requestLogger: (req: RequestWithTiming, res: Response, next: NextFunction) => void;
export declare const errorLogger: (err: any, req: Request, res: Response, next: NextFunction) => void;
declare const _default: {
    requestLogger: (req: RequestWithTiming, res: Response, next: NextFunction) => void;
    errorLogger: (err: any, req: Request, res: Response, next: NextFunction) => void;
};
export default _default;
//# sourceMappingURL=logger.middleware.d.ts.map