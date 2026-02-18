"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBulkTimetablePdf = exports.generateTimetablePdf = void 0;
const pdfmake_1 = __importDefault(require("pdfmake"));
const path_1 = __importDefault(require("path"));
const fonts = {
    PlusJakartaSans: {
        normal: path_1.default.join(__dirname, '../../fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-Regular.ttf'),
        bold: path_1.default.join(__dirname, '../../fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-Bold.ttf'),
        italics: path_1.default.join(__dirname, '../../fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-Italic.ttf'),
        bolditalics: path_1.default.join(__dirname, '../../fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-BoldItalic.ttf')
    }
};
const logoPath = path_1.default.join(__dirname, '../assets/logo.png');
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const getTimetableContent = (timetable, periods, type, name, isFirst = false) => {
    // Sort periods
    const sortedPeriods = [...periods].sort((a, b) => a.periodNo - b.periodNo);
    // Prepare table body
    const tableBody = [];
    // Header Row
    const headerRow = [
        { text: 'Period / Day', style: 'tableHeader' },
        ...DAYS.map(day => ({ text: day, style: 'tableHeader' }))
    ];
    tableBody.push(headerRow);
    // Data Rows
    sortedPeriods.forEach(period => {
        const row = [];
        // Period Cell
        row.push({
            stack: [
                { text: `P${period.periodNo}`, style: 'periodNumber' },
                { text: `${period.startTime} - ${period.endTime}`, style: 'periodTime' }
            ],
            style: 'periodCell'
        });
        // Day Cells
        DAYS.forEach(day => {
            const entry = timetable.find(t => t.periodId === period.id && t.day === day.toUpperCase());
            if (entry) {
                const content = [];
                // Subject
                content.push({
                    text: type === 'teacher'
                        ? `${entry.class.standard} ${entry.class.division} - ${entry.subject.shortCode}`
                        : entry.subject.subjectName,
                    style: 'subjectText'
                });
                // Teacher/Class
                content.push({
                    text: type === 'teacher'
                        ? '' // Class already in subject line for compactness
                        : entry.teacher.name,
                    style: 'teacherText'
                });
                row.push({
                    stack: content,
                    style: 'cellContent'
                });
            }
            else {
                row.push({ text: '-', style: 'emptyCell' });
            }
        });
        tableBody.push(row);
    });
    return [
        {
            text: '',
            pageBreak: isFirst ? undefined : 'before'
        },
        {
            columns: [
                { text: 'Timetable', style: 'header', width: '*' },
                {
                    stack: [
                        { image: logoPath, width: 50, alignment: 'right' },
                        { text: 'Made with Proxi', style: 'branding', alignment: 'right', margin: [0, 2, 0, 0] }
                    ],
                    width: 'auto'
                }
            ],
            margin: [0, 0, 0, 5]
        },
        { text: `${type === 'class' ? 'Class' : 'Teacher'}: ${name}`, style: 'subheader' },
        {
            table: {
                headerRows: 1,
                widths: ['auto', '*', '*', '*', '*', '*', '*'],
                body: tableBody
            },
            layout: {
                hLineWidth: (i) => 1,
                vLineWidth: (i) => 1,
                hLineColor: (i) => '#cccccc',
                vLineColor: (i) => '#cccccc',
                paddingLeft: (i) => 6,
                paddingRight: (i) => 6,
                paddingTop: (i) => 6,
                paddingBottom: (i) => 6,
            }
        }
    ];
};
const getDocDefinition = (content) => ({
    pageOrientation: 'landscape',
    pageSize: 'A4',
    pageMargins: [20, 20, 20, 20],
    content: content,
    styles: {
        header: {
            fontSize: 20,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 5]
        },
        subheader: {
            fontSize: 14,
            alignment: 'center',
            margin: [0, 0, 0, 10]
        },
        tableHeader: {
            bold: true,
            fontSize: 10,
            color: 'black',
            fillColor: '#f3f4f6',
            alignment: 'center',
            margin: [0, 2, 0, 2]
        },
        periodCell: {
            fillColor: '#f9fafb'
        },
        periodNumber: {
            bold: true,
            fontSize: 10,
            alignment: 'center'
        },
        periodTime: {
            fontSize: 9,
            color: '#666666',
            alignment: 'center',
            margin: [0, 1, 0, 0]
        },
        cellContent: {
            alignment: 'center',
            margin: [0, 1, 0, 1]
        },
        subjectText: {
            bold: true,
            fontSize: 10,
            color: '#111827'
        },
        teacherText: {
            fontSize: 9,
            color: '#4b5563',
            margin: [0, 1, 0, 0]
        },
        emptyCell: {
            alignment: 'center',
            color: '#9ca3af',
            margin: [0, 5, 0, 0]
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
});
const generatePdf = (docDefinition) => {
    return new Promise((resolve, reject) => {
        try {
            const printer = new pdfmake_1.default(fonts);
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            const chunks = [];
            pdfDoc.on('data', (chunk) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', (err) => reject(err));
            pdfDoc.end();
        }
        catch (error) {
            reject(error);
        }
    });
};
const generateTimetablePdf = (timetable, periods, type, name) => {
    const content = getTimetableContent(timetable, periods, type, name, true);
    // Remove the empty text block meant for page breaks from the first/only page if present, 
    // though the logic 'isFirst' handles it, checking structure is good.
    const docDefinition = getDocDefinition(content);
    return generatePdf(docDefinition);
};
exports.generateTimetablePdf = generateTimetablePdf;
const generateBulkTimetablePdf = (items, periods) => {
    const allContent = [];
    items.forEach((item, index) => {
        const itemContent = getTimetableContent(item.timetable, periods, item.type, item.name, index === 0);
        allContent.push(...itemContent);
    });
    const docDefinition = getDocDefinition(allContent);
    return generatePdf(docDefinition);
};
exports.generateBulkTimetablePdf = generateBulkTimetablePdf;
