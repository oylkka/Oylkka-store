import vfsFonts from 'pdfmake/build/vfs_fonts';
import PdfPrinter from 'pdfmake/src/Printer';
import cloudinary from '@/cloudinary/cloudinary';
import { prisma } from '@/lib/db';

const vfs = {
  readFileSync: (path: string) => {
    const key = path.replace(/^\//, '');
    const content = (vfsFonts as Record<string, string>)[key];
    if (content) {
      return Buffer.from(content, 'base64');
    }
    throw new Error(`File '${path}' not found in virtual file system`);
  },
  existsSync: (path: string) => {
    const key = path.replace(/^\//, '');
    return !!(vfsFonts as Record<string, string>)[key];
  },
};

const urlResolver = {
  resolve: (url: string) => ({ url, headers: {} as Record<string, string> }),
  resolved: () => Promise.resolve(),
};

const fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf',
  },
};

const printer = new PdfPrinter(fonts, vfs, urlResolver, () => true);

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
}

export async function generateInvoicePdf(
  orderId: string,
): Promise<string | null> {
  try {
    const existing = await prisma.invoice.findUnique({
      where: { orderId },
    });

    if (existing?.pdfUrl) {
      return existing.pdfUrl;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { select: { name: true, email: true } },
        items: {
          include: {
            shop: { select: { name: true } },
          },
        },
      },
    });

    if (!order) return null;

    const invoiceNumber = `INV-${order.orderNumber}`;

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 60],
      defaultStyle: { font: 'Roboto', fontSize: 9 },
      header: () => ({
        columns: [
          {
            text: 'OYLKKA',
            fontSize: 22,
            bold: true,
            color: '#18181b',
          },
          {
            text: 'INVOICE',
            fontSize: 22,
            bold: true,
            color: '#18181b',
            alignment: 'right',
          },
        ],
        margin: [40, 30, 40, 10],
      }),
      footer: (currentPage: number, pageCount: number) => ({
        text: `Oylkka — Invoice ${invoiceNumber} | Page ${currentPage} of ${pageCount}`,
        alignment: 'center',
        fontSize: 7,
        color: '#a1a1aa',
        margin: [40, 0, 40, 0],
      }),
      content: [
        {
          columns: [
            {
              text: [
                { text: 'Invoice #: ', bold: true, fontSize: 10 },
                { text: invoiceNumber, fontSize: 10 },
                { text: '\nDate: ', bold: true, fontSize: 10 },
                { text: formatDate(order.createdAt), fontSize: 10 },
                {
                  text: `\nPayment: ${order.paymentMethod ?? 'N/A'}`,
                  fontSize: 10,
                  color: '#52525b',
                },
                {
                  text: `\nStatus: ${order.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}`,
                  fontSize: 10,
                  color: order.paymentStatus === 'PAID' ? '#16a34a' : '#ea580c',
                },
              ],
              alignment: 'left',
            },
            {
              text: [
                { text: 'Bill To:\n', bold: true, fontSize: 10 },
                { text: `${order.shippingName}\n`, fontSize: 9 },
                { text: `${order.shippingEmail}\n`, fontSize: 9 },
                { text: `${order.shippingPhone}\n`, fontSize: 9 },
                { text: `${order.shippingAddress}\n`, fontSize: 9 },
                {
                  text: `${order.shippingUpzila}, ${order.shippingDistrict}${order.shippingPostalCode ? ` - ${order.shippingPostalCode}` : ''}`,
                  fontSize: 9,
                },
              ],
              alignment: 'right',
            },
          ],
          margin: [0, 20, 0, 0],
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: '#', style: 'tableHeader' },
                { text: 'Item', style: 'tableHeader' },
                { text: 'Shop', style: 'tableHeader', alignment: 'center' },
                { text: 'Qty', style: 'tableHeader', alignment: 'center' },
                { text: 'Price', style: 'tableHeader', alignment: 'right' },
                { text: 'Total', style: 'tableHeader', alignment: 'right' },
              ],
              ...order.items.map((item, i) => [
                { text: `${i + 1}`, alignment: 'center', fontSize: 8 },
                {
                  text: `${item.productName}${item.variantName ? ` (${item.variantName})` : ''}`,
                  fontSize: 8,
                },
                {
                  text: item.shop.name,
                  alignment: 'center',
                  fontSize: 8,
                },
                { text: `${item.quantity}`, alignment: 'center', fontSize: 8 },
                {
                  text: formatCurrency(item.unitPrice),
                  alignment: 'right',
                  fontSize: 8,
                },
                {
                  text: formatCurrency(item.total),
                  alignment: 'right',
                  fontSize: 8,
                  bold: true,
                },
              ]),
            ],
          },
          layout: {
            hLineWidth: (_i: number, node: { table: { body: unknown[] } }) =>
              _i === 0 || _i === 1 || _i === node.table.body.length ? 0.5 : 0.1,
            vLineWidth: () => 0,
            hLineColor: () => '#e4e4e7',
            paddingLeft: (_i: number) => 6,
            paddingRight: (_i: number) => 6,
            paddingTop: (_i: number) => 5,
            paddingBottom: (_i: number) => 5,
          },
          margin: [0, 16, 0, 0],
        },
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              layout: 'noBorders',
              table: {
                widths: ['auto', 'auto'],
                body: [
                  [
                    { text: 'Subtotal', alignment: 'right', fontSize: 9 },
                    {
                      text: formatCurrency(order.subtotal),
                      alignment: 'right',
                      fontSize: 9,
                    },
                  ],
                  ...(order.discountAmount > 0
                    ? [
                        [
                          {
                            text: 'Discount',
                            alignment: 'right',
                            fontSize: 9,
                            color: '#16a34a',
                          },
                          {
                            text: `-${formatCurrency(order.discountAmount)}`,
                            alignment: 'right',
                            fontSize: 9,
                            color: '#16a34a',
                          },
                        ],
                      ]
                    : []),
                  ...(order.couponDiscount && order.couponDiscount > 0
                    ? [
                        [
                          {
                            text: `Coupon (${order.couponCode})`,
                            alignment: 'right',
                            fontSize: 9,
                            color: '#16a34a',
                          },
                          {
                            text: `-${formatCurrency(order.couponDiscount)}`,
                            alignment: 'right',
                            fontSize: 9,
                            color: '#16a34a',
                          },
                        ],
                      ]
                    : []),
                  [
                    {
                      text: 'Shipping',
                      alignment: 'right',
                      fontSize: 9,
                    },
                    {
                      text:
                        order.shippingCost > 0
                          ? formatCurrency(order.shippingCost)
                          : 'Free',
                      alignment: 'right',
                      fontSize: 9,
                    },
                  ],
                  [
                    {
                      text: 'Total',
                      alignment: 'right',
                      fontSize: 11,
                      bold: true,
                    },
                    {
                      text: formatCurrency(order.total),
                      alignment: 'right',
                      fontSize: 11,
                      bold: true,
                    },
                  ],
                ],
              },
              margin: [0, 8, 0, 0],
            },
          ],
        },
        {
          text: '\n\nThank you for your order!',
          alignment: 'center',
          fontSize: 9,
          color: '#71717a',
          margin: [0, 20, 0, 0],
        },
      ],
      styles: {
        tableHeader: {
          fontSize: 8,
          bold: true,
          color: '#18181b',
          fillColor: '#f4f4f5',
        },
      },
    };

    const pdfDoc = await printer.createPdfKitDocument(docDefinition);

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', resolve);
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });

    const pdfBuffer = Buffer.concat(chunks);

    const uploadResult = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'invoices',
            public_id: `inv-${order.orderNumber}`,
            resource_type: 'raw',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve({ secure_url: result?.secure_url ?? '' });
          },
        );
        stream.end(pdfBuffer);
      },
    );

    if (!uploadResult.secure_url) return null;

    await prisma.invoice.create({
      data: {
        orderId: order.id,
        invoiceNumber,
        pdfUrl: uploadResult.secure_url,
      },
    });

    return uploadResult.secure_url;
  } catch {
    return null;
  }
}
