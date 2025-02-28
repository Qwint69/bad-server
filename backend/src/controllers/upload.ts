import { NextFunction, Request, Response } from 'express';
import { constants } from 'http2';
import { join } from 'path';
import BadRequestError from '../errors/bad-request-error';

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'));
    }
    
    try {
        const filePath = process.env.UPLOAD_PATH
            ? join('/', process.env.UPLOAD_PATH, req.file.filename)
            : join('/', req.file.filename);
        
        return res.status(constants.HTTP_STATUS_CREATED).json({
            fileName: filePath,
            originalName: req.file.originalname,
        });
    } catch (error) {
        return next(error);
    }
};
