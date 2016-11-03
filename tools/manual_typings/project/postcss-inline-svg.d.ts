declare module 'postcss-inline-svg' {

  interface IOptions {
    path?: string|boolean;
    encode?: boolean;
    transform?: (data: string, path: string, opts: any) => any;
  }

  interface IInlineSvg {
    (opts?: IOptions): NodeJS.ReadWriteStream;
  }

  const inlineSvg: IInlineSvg;
  export = inlineSvg;
}

