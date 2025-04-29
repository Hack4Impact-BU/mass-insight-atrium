import { TimeFilterOption } from './types';

export const downloadAsCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => JSON.stringify(row[header] ?? '')).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
};

export const getTimeRangeFromOption = (option: TimeFilterOption, customRange?: { start: Date; end: Date }) => {
    const end = new Date();
    let start = new Date();

    switch (option) {
        case '7days':
            start.setDate(end.getDate() - 7);
            break;
        case '30days':
            start.setDate(end.getDate() - 30);
            break;
        case '90days':
            start.setDate(end.getDate() - 90);
            break;
        case 'custom':
            if (customRange) {
                return customRange;
            }
            start.setDate(end.getDate() - 30); // Default to 30 days if no custom range
            break;
    }

    return { start, end };
}; 