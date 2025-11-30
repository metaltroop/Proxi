import PdfPrinter from 'pdfmake';
import path from 'path';
import { Timetable, Class, Teacher, Subject, Period } from '@prisma/client';

const fonts = {
    PlusJakartaSans: {
        normal: path.join(__dirname, '../../fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-Regular.ttf'),
        bold: path.join(__dirname, '../../fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-Bold.ttf'),
        italics: path.join(__dirname, '../../fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-Italic.ttf'),
        bolditalics: path.join(__dirname, '../../fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-BoldItalic.ttf')
    }
};

const logoPath = path.join(__dirname, '../assets/logo.png');

const printer = new PdfPrinter(fonts);

type TimetableWithRelations = Timetable & {
    class: Class;
    teacher: Teacher;
    subject: Subject;
    period: Period;
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const generateTimetablePdf = (
    timetable: TimetableWithRelations[],
    periods: Period[],
    type: 'class' | 'teacher',
    name: string
): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            // Sort periods
            const sortedPeriods = [...periods].sort((a, b) => a.periodNo - b.periodNo);

            // Prepare table body
            const tableBody: any[] = [];

            // Header Row
            const headerRow = [
                { text: 'Period / Day', style: 'tableHeader' },
                ...DAYS.map(day => ({ text: day, style: 'tableHeader' }))
            ];
            tableBody.push(headerRow);

            // Data Rows
            sortedPeriods.forEach(period => {
                const row: any[] = [];

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
                    } else {
                        row.push({ text: '-', style: 'emptyCell' });
                    }
                });

                tableBody.push(row);
            });

            const docDefinition = {
                pageOrientation: 'landscape',
                pageSize: 'A4',
                pageMargins: [20, 20, 20, 20],
                content: [
                    {
                        columns: [
                            { text: 'Timetable', style: 'header', width: '*' },
                            { image: logoPath, width: 60, alignment: 'right' }
                        ],
                        margin: [0, 0, 0, 5]
                    } as any,
                    { text: `${type === 'class' ? 'Class' : 'Teacher'}: ${name}`, style: 'subheader' },
                    {
                        table: {
                            headerRows: 1,
                            widths: ['auto', '*', '*', '*', '*', '*', '*'],
                            body: tableBody
                        },
                        layout: {
                            hLineWidth: (i: number) => 1,
                            vLineWidth: (i: number) => 1,
                            hLineColor: (i: number) => '#cccccc',
                            vLineColor: (i: number) => '#cccccc',
                            paddingLeft: (i: number) => 6,
                            paddingRight: (i: number) => 6,
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
                    }
                },
                defaultStyle: {
                    font: 'PlusJakartaSans'
                }
            };

            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            const chunks: any[] = [];
            pdfDoc.on('data', (chunk) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.end();

        } catch (error) {
            reject(error);
        }
    });
};
