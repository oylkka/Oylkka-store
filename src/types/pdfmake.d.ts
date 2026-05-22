declare module 'pdfmake/src/Printer' {
  import type { PassThrough } from 'node:stream';

  interface FontDescriptor {
    normal: string;
    bold: string;
    italics: string;
    bolditalics: string;
  }

  interface VirtualFileSystem {
    readFileSync(path: string): Buffer;
    existsSync(path: string): boolean;
  }

  interface UrlResolver {
    resolve(url: string): { url: string; headers: Record<string, string> };
    resolved(): Promise<void>;
  }

  type LocalAccessPolicy = (path: string) => boolean;

  class PdfPrinter {
    constructor(
      fontDescriptors: Record<string, FontDescriptor>,
      virtualfs: VirtualFileSystem,
      urlResolver: UrlResolver,
      localAccessPolicy: LocalAccessPolicy,
    );
    createPdfKitDocument(
      docDefinition: Record<string, unknown>,
      options?: Record<string, unknown>,
    ): Promise<PassThrough>;
  }

  export default PdfPrinter;
}

declare module 'pdfmake/build/vfs_fonts' {
  const vfs: Record<string, string>;
  export default vfs;
}
