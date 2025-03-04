import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import { join, extname } from 'path'
import { stat } from 'fs/promises'
import sharp from 'sharp'
import { faker } from '@faker-js/faker'
import BadRequestError from '../errors/bad-request-error'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }

    try {
        const fileStat = await stat(req.file.path)
        if (fileStat.size < 2048) {
            return next(
                new BadRequestError('Размер файла должен быть больше 2KB')
            )
        }
        if (fileStat.size > 10 * 1024 * 1024) {
            return next(
                new BadRequestError('Размер файла не должен превышать 10MB')
            )
        }

        try {
            const image = await sharp(req.file.path).metadata()
            if (!image.format) {
                return next(
                    new BadRequestError('Файл не является изображением')
                )
            }
        } catch {
            return next(new BadRequestError('Ошибка при обработке изображения'))
        }

        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file.filename}`

        res.status(constants.HTTP_STATUS_CREATED).json({
            fileName,
            originalName: req.file.originalname,
        })
    } catch (error) {
        //     const uniqueFileName =
        //         faker.string.uuid() + extname(req.file.originalname)
        //     const filePath = process.env.UPLOAD_PATH
        //         ? join('/', process.env.UPLOAD_PATH, uniqueFileName)
        //         : join('/', uniqueFileName)

        //     return res.status(constants.HTTP_STATUS_CREATED).json({
        //         fileName: filePath,
        //     })
        // }
        return next(error)
    }
}
