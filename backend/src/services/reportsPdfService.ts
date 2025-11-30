import PdfPrinter from 'pdfmake';
import path from 'path';

// Font configuration
const fonts = {
    PlusJakartaSans: {
        normal: path.join(__dirname, '../../fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-Regular.ttf'),
        bold: path.join(__dirname, '../../fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-Bold.ttf'),
        italics: path.join(__dirname, '../../fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-Italic.ttf'),
        bolditalics: path.join(__dirname, '../../fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-BoldItalic.ttf')
    }
};

const logoPath = path.join(__dirname, '../assets/logo.png');

interface ProxyReport {
    id: string;
    date: Date;
    absentTeacher: { name: string; employeeId: string | null };
    assignedTeacher: { name: string; employeeId: string | null };
    class: { className: string; standard: number; division: string };
    subject: { subjectName: string; shortCode: string };
    period: { periodNo: number; startTime: string; endTime: string };
    status: string;
}

export const generateProxyReportPdf = (
    proxies: ProxyReport[],
    startDate: string,
    endDate: string
): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const printer = new PdfPrinter(fonts);

            // Build table rows
            const tableBody: any[] = [
                // Header row
                [
                    { text: 'Date', style: 'tableHeader' },
                    { text: 'Period', style: 'tableHeader' },
                    { text: 'Absent Teacher', style: 'tableHeader' },
                    { text: 'Proxy Teacher', style: 'tableHeader' },
                    { text: 'Class', style: 'tableHeader' },
                    { text: 'Subject', style: 'tableHeader' },
                    { text: 'Status', style: 'tableHeader' }
                ]
            ];

            // Data rows
            proxies.forEach(proxy => {
                tableBody.push([
                    { text: new Date(proxy.date).toLocaleDateString(), style: 'cellContent' },
                    { text: `P${proxy.period.periodNo}\n${proxy.period.startTime}-${proxy.period.endTime}`, style: 'cellContent' },
                    { text: proxy.absentTeacher.name, style: 'absentTeacher' },
                    { text: proxy.assignedTeacher.name, style: 'proxyTeacher' },
                    { text: proxy.class.className, style: 'cellContent' },
                    { text: proxy.subject.subjectName, style: 'cellContent' },
                    { text: proxy.status, style: 'statusCell' }
                ]);
            });

            const docDefinition: any = {
                pageSize: 'A4',
                pageOrientation: 'portrait',
                pageMargins: [40, 60, 40, 60],
                content: [
                    {
                        columns: [
                            { text: 'Proxy Assignment Report', style: 'header', width: '*' },
                            {
                                stack: [
                                    { image: logoPath, width: 50, alignment: 'right' },
                                    { text: 'Made with Proxi', style: 'branding', alignment: 'right', margin: [0, 2, 0, 0] }
                                ],
                                width: 'auto'
                            }
                        ],
                        margin: [0, 0, 0, 10]
                    } as any,
                    {
                        text: `Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`,
                        style: 'subheader'
                    },
                    {
                        text: `Total Assignments: ${proxies.length}`,
                        style: 'summary',
                        margin: [0, 0, 0, 15]
                    },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['auto', 'auto', '*', '*', 'auto', '*', 'auto'],
                            body: tableBody
                        },
                        layout: {
                            hLineWidth: (i: number) => 1,
                            vLineWidth: (i: number) => 1,
                            hLineColor: (i: number) => '#cccccc',
                            vLineColor: (i: number) => '#cccccc',
                            paddingLeft: (i: number) => 8,
                            paddingRight: (i: number) => 8,
                            paddingTop: (i: number) => 6,
                            paddingBottom: (i: number) => 6,
                        }
                    }
                ],
                styles: {
                    header: {
                        fontSize: 20,
                        bold: true,
                        alignment: 'center',
                        margin: [0, 0, 0, 10],
                        color: '#111827'
                    },
                    subheader: {
                        fontSize: 12,
                        alignment: 'center',
                        margin: [0, 0, 0, 5],
                        color: '#6b7280'
                    },
                    summary: {
                        fontSize: 11,
                        alignment: 'center',
                        color: '#374151'
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 10,
                        color: '#111827',
                        fillColor: '#f3f4f6',
                        alignment: 'left'
                    },
                    cellContent: {
                        fontSize: 9,
                        color: '#374151',
                        alignment: 'left'
                    },
                    absentTeacher: {
                        fontSize: 9,
                        color: '#dc2626',
                        bold: true,
                        alignment: 'left'
                    },
                    proxyTeacher: {
                        fontSize: 9,
                        color: '#16a34a',
                        bold: true,
                        alignment: 'left'
                    },
                    statusCell: {
                        fontSize: 8,
                        color: '#6b7280',
                        alignment: 'center'
                    },
                    branding: {
                        fontSize: 8,
                        color: '#6b7280',
                        italics: true
                    }
                },
                defaultStyle: {
                    font: 'PlusJakartaSans'
                }
            };

            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            const chunks: Buffer[] = [];

            pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', reject);

            pdfDoc.end();
        } catch (error) {
            reject(error);
        }
    });
};
