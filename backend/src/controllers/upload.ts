import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import { join } from 'path'
import { stat, writeFile, unlink } from 'fs/promises'
import sharp from 'sharp'
import BadRequestError from '../errors/bad-request-error'
import { tmpdir } from 'os'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }
    const tempFilePath = join(tmpdir(), req.file.filename)

    try {
        await writeFile(tempFilePath, req.file.buffer)

        const fileStat = await stat(tempFilePath)
        if (fileStat.size < 2048) {
            await unlink(tempFilePath)
            return next(
                new BadRequestError('Размер файла должен быть больше 2KB')
            )
        }
        if (fileStat.size > 10 * 1024 * 1024) {
            await unlink(tempFilePath)
            return next(
                new BadRequestError('Размер файла не должен превышать 10MB')
            )
        }

        try {
            const image = await sharp(tempFilePath).metadata()
            if (!image.format) {
                await unlink(tempFilePath)
                return next(
                    new BadRequestError('Файл не является изображением')
                )
            }
        } catch {
            await unlink(tempFilePath)
            return next(new BadRequestError('Ошибка при обработке изображения'))
        }

        const filePath = process.env.UPLOAD_PATH
            ? join('/', process.env.UPLOAD_PATH, req.file.filename)
            : join('/', req.file.filename)

        await unlink(tempFilePath)

        return res.status(constants.HTTP_STATUS_CREATED).json({
            fileName: filePath,
        })
    } catch (error) {
        await unlink(tempFilePath).catch(() => null)
        return next(error)
    }
}
