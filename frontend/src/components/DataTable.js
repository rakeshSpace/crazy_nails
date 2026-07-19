import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const DataTable = ({
    columns,
    data,
    title,
    actions,
    progressPending = false,
    searchable = true,
    pagination = true,
    itemsPerPage = 10,
    noDataMessage = "No data found",
    onRowClick,
    onRowDoubleClick,
    selectable = false,
    onSelectionChange,
    exportable = false,
    exportFileName = "export",
    sortable = true
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [selectedRows, setSelectedRows] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [showExportDropdown, setShowExportDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Check if mobile view
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowExportDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        let result = [...data];
        
        // Search filter
        if (searchTerm && searchable) {
            result = result.filter(row => {
                return columns.some(column => {
                    const value = column.selector ? column.selector(row) : row[column.name?.toLowerCase()];
                    return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
                });
            });
        }
        
        // Sorting
        if (sortColumn && sortable) {
            result.sort((a, b) => {
                let aVal = sortColumn.selector ? sortColumn.selector(a) : a[sortColumn.name?.toLowerCase()];
                let bVal = sortColumn.selector ? sortColumn.selector(b) : b[sortColumn.name?.toLowerCase()];
                
                if (typeof aVal === 'string') {
                    return sortDirection === 'asc' 
                        ? aVal.localeCompare(bVal) 
                        : bVal.localeCompare(aVal);
                }
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            });
        }
        
        setFilteredData(result);
        setCurrentPage(1);
    }, [data, searchTerm, sortColumn, sortDirection, columns, searchable, sortable]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handleSort = (column) => {
        if (!sortable || column.sortable === false) return;
        
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const handleSelectAll = () => {
        if (selectedRows.length === currentItems.length) {
            setSelectedRows([]);
            onSelectionChange?.([]);
        } else {
            const newSelected = currentItems.map(item => item.id);
            setSelectedRows(newSelected);
            onSelectionChange?.(newSelected);
        }
    };

    const handleSelectRow = (id) => {
        const newSelected = selectedRows.includes(id)
            ? selectedRows.filter(rowId => rowId !== id)
            : [...selectedRows, id];
        setSelectedRows(newSelected);
        onSelectionChange?.(newSelected);
    };

    // Get data for export (either filtered data or selected rows)
    const getExportData = (useSelectedOnly = false) => {
        let dataToExport = useSelectedOnly && selectedRows.length > 0 
            ? filteredData.filter(row => selectedRows.includes(row.id))
            : filteredData;
        
        return dataToExport.map(row => {
            const exportRow = {};
            columns.forEach(col => {
                let value = col.selector ? col.selector(row) : row[col.name?.toLowerCase()];
                if (typeof value === 'object' && value !== null) {
                    value = JSON.stringify(value);
                }
                exportRow[col.name] = value || '';
            });
            return exportRow;
        });
    };

    // Export to CSV
    const exportToCSV = () => {
        const exportData = getExportData(false);
        if (exportData.length === 0) {
            alert('No data to export');
            return;
        }
        
        const headers = Object.keys(exportData[0]);
        const rows = exportData.map(row => 
            headers.map(header => `"${row[header] || ''}"`).join(',')
        );
        
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportFileName}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setShowExportDropdown(false);
    };

    // Export to Excel (XLSX)
    const exportToExcel = () => {
        const exportData = getExportData(false);
        if (exportData.length === 0) {
            alert('No data to export');
            return;
        }
        
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
        XLSX.writeFile(wb, `${exportFileName}.xlsx`);
        setShowExportDropdown(false);
    };

    // Export to PDF
    const exportToPDF = () => {
        const exportData = getExportData(false);
        if (exportData.length === 0) {
            alert('No data to export');
            return;
        }
        
        const doc = new jsPDF('landscape');
        
        // Add title
        doc.setFontSize(16);
        doc.text(title || 'Data Export', 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);
        
        // Prepare table data
        const headers = Object.keys(exportData[0]);
        const rows = exportData.map(row => headers.map(header => row[header] || ''));
        
        doc.autoTable({
            head: [headers],
            body: rows,
            startY: 35,
            theme: 'striped',
            headStyles: { fillColor: [212, 165, 116], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
        });
        
        doc.save(`${exportFileName}.pdf`);
        setShowExportDropdown(false);
    };

    // Copy to clipboard
    const copyToClipboard = async () => {
        const exportData = getExportData(false);
        if (exportData.length === 0) {
            alert('No data to copy');
            return;
        }
        
        const headers = Object.keys(exportData[0]);
        const rows = exportData.map(row => 
            headers.map(header => row[header] || '').join('\t')
        );
        const text = [headers.join('\t'), ...rows].join('\n');
        
        try {
            await navigator.clipboard.writeText(text);
            alert('Data copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Failed to copy data');
        }
        setShowExportDropdown(false);
    };

    // Print data
    const printData = () => {
        const exportData = getExportData(false);
        if (exportData.length === 0) {
            alert('No data to print');
            return;
        }
        
        const printWindow = window.open('', '_blank');
        const headers = Object.keys(exportData[0]);
        
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title || 'Data Export'}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #d4a574; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #d4a574; color: white; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <h1>${title || 'Data Export'}</h1>
                <p>Generated on: ${new Date().toLocaleString()}</p>
                <table>
                    <thead>
                        <tr>
                            ${headers.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${exportData.map(row => `
                            <tr>
                                ${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="footer">
                    <p>Total Records: ${exportData.length}</p>
                </div>
            </body>
            </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
        setShowExportDropdown(false);
    };

    // Export selected only
    const exportSelected = () => {
        if (selectedRows.length === 0) {
            alert('No rows selected. Please select rows to export.');
            return;
        }
        
        const exportData = getExportData(true);
        if (exportData.length === 0) {
            alert('No data to export');
            return;
        }
        
        const headers = Object.keys(exportData[0]);
        const rows = exportData.map(row => 
            headers.map(header => `"${row[header] || ''}"`).join(',')
        );
        
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportFileName}_selected.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setShowExportDropdown(false);
    };

    const getSortIcon = (column) => {
        if (sortColumn !== column) return <i className="fas fa-sort text-gray-400 ml-1"></i>;
        return sortDirection === 'asc' 
            ? <i className="fas fa-sort-up text-primary ml-1"></i>
            : <i className="fas fa-sort-down text-primary ml-1"></i>;
    };

    // Export options component
    const ExportDropdown = () => (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="btn-outline btn-small flex items-center gap-2"
            >
                <i className="fas fa-download"></i> Export
                <i className={`fas fa-chevron-${showExportDropdown ? 'up' : 'down'} text-xs`}></i>
            </button>
            
            {showExportDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark rounded-xl shadow-lg border border-light-gray dark:border-gray-700 z-50 overflow-hidden">
                    <div className="py-1">
                        <button
                            onClick={exportToCSV}
                            className="w-full px-4 py-2 text-left hover:bg-light dark:hover:bg-dark-light flex items-center gap-3 transition-colors"
                        >
                            <i className="fas fa-file-csv text-green-600 w-5"></i>
                            <span>Export as CSV</span>
                        </button>
                        <button
                            onClick={exportToExcel}
                            className="w-full px-4 py-2 text-left hover:bg-light dark:hover:bg-dark-light flex items-center gap-3 transition-colors"
                        >
                            <i className="fas fa-file-excel text-green-700 w-5"></i>
                            <span>Export as Excel</span>
                        </button>
                        <button
                            onClick={exportToPDF}
                            className="w-full px-4 py-2 text-left hover:bg-light dark:hover:bg-dark-light flex items-center gap-3 transition-colors"
                        >
                            <i className="fas fa-file-pdf text-red-600 w-5"></i>
                            <span>Export as PDF</span>
                        </button>
                        <button
                            onClick={copyToClipboard}
                            className="w-full px-4 py-2 text-left hover:bg-light dark:hover:bg-dark-light flex items-center gap-3 transition-colors"
                        >
                            <i className="fas fa-copy text-blue-600 w-5"></i>
                            <span>Copy to Clipboard</span>
                        </button>
                        <button
                            onClick={printData}
                            className="w-full px-4 py-2 text-left hover:bg-light dark:hover:bg-dark-light flex items-center gap-3 transition-colors"
                        >
                            <i className="fas fa-print text-gray-600 w-5"></i>
                            <span>Print</span>
                        </button>
                        
                        {selectable && selectedRows.length > 0 && (
                            <>
                                <div className="border-t border-light-gray dark:border-gray-700 my-1"></div>
                                <button
                                    onClick={exportSelected}
                                    className="w-full px-4 py-2 text-left hover:bg-light dark:hover:bg-dark-light flex items-center gap-3 transition-colors"
                                >
                                    <i className="fas fa-check-square text-primary w-5"></i>
                                    <span>Export Selected ({selectedRows.length})</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    // Mobile card view
    const MobileCardView = () => (
        <div className="space-y-3 p-4">
            {currentItems.length === 0 ? (
                <div className="text-center py-12">
                    <i className="fas fa-inbox text-4xl text-gray-300 mb-2"></i>
                    <p className="text-gray">{noDataMessage}</p>
                </div>
            ) : (
                currentItems.map((row, idx) => (
                    <div
                        key={idx}
                        onClick={() => onRowClick?.(row)}
                        onDoubleClick={() => onRowDoubleClick?.(row)}
                        className="bg-white dark:bg-dark-light rounded-xl p-4 border border-light-gray dark:border-gray-700 shadow-sm"
                    >
                        {columns.map((column, colIdx) => (
                            <div key={colIdx} className="flex justify-between py-2 border-b border-light-gray dark:border-gray-700 last:border-0">
                                <span className="font-medium text-gray-600 dark:text-gray-400 text-sm">{column.name}:</span>
                                <span className="text-dark dark:text-white text-sm">
                                    {column.cell ? column.cell(row) : (column.selector ? column.selector(row) : row[column.name?.toLowerCase()])}
                                </span>
                            </div>
                        ))}
                        {selectable && (
                            <div className="mt-3 pt-2 border-t border-light-gray dark:border-gray-700">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.includes(row.id)}
                                        onChange={() => handleSelectRow(row.id)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm text-gray">Select this item</span>
                                </label>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );

    if (progressPending) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-dark rounded-xl shadow-soft overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-light-gray dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    {title && <h3 className="text-lg font-semibold">{title}</h3>}
                    <p className="text-sm text-gray mt-1">
                        Total {filteredData.length} records found
                        {selectedRows.length > 0 && ` | ${selectedRows.length} selected`}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {searchable && (
                        <div className="relative flex-1 sm:flex-initial">
                            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 pl-9 pr-4 py-2 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-dark-light text-sm"
                            />
                        </div>
                    )}
                    {exportable && <ExportDropdown />}
                    {actions}
                </div>
            </div>

            {/* Desktop Table View */}
            {!isMobile && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-light dark:bg-dark-light">
                            <tr>
                                {selectable && (
                                    <th className="px-4 py-3 text-left w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.length === currentItems.length && currentItems.length > 0}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 rounded"
                                        />
                                    </th>
                                )}
                                {columns.map((column, index) => (
                                    <th
                                        key={index}
                                        onClick={() => handleSort(column)}
                                        className={`px-4 py-3 text-left font-semibold text-dark dark:text-white text-sm ${
                                            sortable && column.sortable !== false ? 'cursor-pointer hover:text-primary transition-colors' : ''
                                        }`}
                                        style={{ width: column.width }}
                                    >
                                        <div className="flex items-center gap-1">
                                            {column.name}
                                            {sortable && column.sortable !== false && getSortIcon(column)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center">
                                        <i className="fas fa-inbox text-4xl text-gray-300 mb-2"></i>
                                        <p className="text-gray">{noDataMessage}</p>
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((row, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        onClick={() => onRowClick?.(row)}
                                        onDoubleClick={() => onRowDoubleClick?.(row)}
                                        className={`border-t border-light-gray dark:border-gray-700 hover:bg-light dark:hover:bg-dark-light transition-all cursor-pointer ${
                                            selectedRows.includes(row.id) ? 'bg-primary/5' : ''
                                        }`}
                                    >
                                        {selectable && (
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(row.id)}
                                                    onChange={() => handleSelectRow(row.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-4 h-4 rounded"
                                                />
                                            </td>
                                        )}
                                        {columns.map((column, colIndex) => (
                                            <td key={colIndex} className="px-4 py-3 text-sm">
                                                {column.cell ? column.cell(row) : (column.selector ? column.selector(row) : row[column.name?.toLowerCase()])}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Mobile Card View */}
            {isMobile && <MobileCardView />}

            {/* Pagination */}
            {pagination && totalPages > 1 && (
                <div className="p-4 border-t border-light-gray dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray order-2 sm:order-1">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
                    </div>
                    <div className="flex gap-2 order-1 sm:order-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded-lg border border-light-gray dark:border-gray-700 disabled:opacity-50 hover:border-primary transition-colors text-sm"
                        >
                            <i className="fas fa-chevron-left text-xs"></i> Prev
                        </button>
                        <div className="flex gap-1">
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-8 h-8 rounded-lg transition-all text-sm ${
                                            currentPage === pageNum
                                                ? 'bg-primary text-white'
                                                : 'hover:bg-light dark:hover:bg-dark-light'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded-lg border border-light-gray dark:border-gray-700 disabled:opacity-50 hover:border-primary transition-colors text-sm"
                        >
                            Next <i className="fas fa-chevron-right text-xs"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;