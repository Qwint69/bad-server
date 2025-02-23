export const sanitizeString = (input: any): string => {
    if (typeof input !== 'string') return ''
    return input.replace(/[^\w\sа-яА-ЯёЁ@.-]/gi, '')
}

export const fixPaginationParams = (query: any) => {
    let page = Number(query.page) || 1
    let limit = Number(query.limit) || 10

    if (limit > 100) limit = 100
    if (page < 1) page = 1

    return { page, limit }
}
