"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProxyReportPdf = void 0;
const pdfmake_1 = __importDefault(require("pdfmake"));
const path_1 = __importDefault(require("path"));
// Font configuration
const fonts = {
    PlusJakartaSans: {
        normal: path_1.default.join(__dirname, '../../fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-Regular.ttf'),
        bold: path_1.default.join(__dirname, '../../fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-Bold.ttf'),
        italics: path_1.default.join(__dirname, '../../fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-Italic.ttf'),
        bolditalics: path_1.default.join(__dirname, '../../fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-BoldItalic.ttf')
    }
};
const logoPath = path_1.default.join(__dirname, '../assets/logo.png');
const generateProxyReportPdf = (proxies, startDate, endDate) => {
    return new Promise((resolve, reject) => {
        try {
            const printer = new pdfmake_1.default(fonts);
            // Build table rows
            const tableBody = [
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
            const docDefinition = {
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
                    },
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
                            hLineWidth: (i) => 1,
                            vLineWidth: (i) => 1,
                            hLineColor: (i) => '#cccccc',
                            vLineColor: (i) => '#cccccc',
                            paddingLeft: (i) => 8,
                            paddingRight: (i) => 8,
                            paddingTop: (i) => 6,
                            paddingBottom: (i) => 6,
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
            const printerInstance = new pdfmake_1.default(fonts);
            const pdfDoc = printerInstance.createPdfKitDocument(docDefinition);
            const chunks = [];
            pdfDoc.on('data', (chunk) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', reject);
            pdfDoc.end();
        }
        catch (error) {
            reject(error);
        }
    });
};
exports.generateProxyReportPdf = generateProxyReportPdf;
