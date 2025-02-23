import { CSRF_COOKIE_NAME, CSRF_SECRET } from 'config'
import { doubleCsrf } from 'csrf-csrf'

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
}

export const { invalidCsrfTokenError, generateToken, doubleCsrfProtection } =
    doubleCsrf({
        getSecret: () => CSRF_SECRET,
        cookieName: CSRF_COOKIE_NAME,
        cookieOptions: cookieOptions,
    })
