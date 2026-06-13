declare module 'xss-clean' {
  import { RequestHandler } from 'express'
  function xssClean(): RequestHandler
  export default xssClean
}

declare module 'express-mongo-sanitize' {
  import { RequestHandler } from 'express'
  function mongoSanitize(): RequestHandler
  export default mongoSanitize
}

declare module 'hpp' {
  import { RequestHandler } from 'express'
  interface HppOptions {
    whitelist?: string | string[]
    checkBody?: boolean
    checkBodyOnlyForContentType?: string
    checkQuery?: boolean
  }
  function hpp(options?: HppOptions): RequestHandler
  export default hpp
}
