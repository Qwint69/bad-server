import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import { join } from 'path'
import { writeFile, unlink } from 'fs/promises'
import sharp from 'sharp'
import { tmpdir } from 'os'
import BadRequestError from '../errors/bad-request-error'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }

    const fileSize = req.file.size
    if (fileSize < 2048) {
        return next(new BadRequestError('Размер файла должен быть больше 2KB'))
    }
    if (fileSize > 10 * 1024 * 1024) {
        return next(
            new BadRequestError('Размер файла не должен превышать 10MB')
        )
    }

    try {
        const image = await sharp(req.file.buffer).metadata()
        if (!image.format) {
            return next(new BadRequestError('Файл не является изображением'))
        }
    } catch {
        return next(new BadRequestError('Ошибка при обработке изображения'))
    }

    const tempFilePath = join(tmpdir(), req.file.filename)

    try {
        await writeFile(tempFilePath, req.file.buffer)

        const filePath = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file.filename}`

        return res.status(constants.HTTP_STATUS_CREATED).json({
            fileName: filePath,
        })
    } catch (error) {
        return next(error)
    }
}
