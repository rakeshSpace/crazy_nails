import React, { useState, useEffect } from 'react';

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

    // Check if mobile view
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
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

    const exportToCSV = () => {
        const headers = columns.map(col => col.name);
        const rows = filteredData.map(row => 
            columns.map(col => {
                let value = col.selector ? col.selector(row) : row[col.name?.toLowerCase()];
                if (typeof value === 'object') value = JSON.stringify(value);
                return `"${value}"`;
            }).join(',')
        );
        
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportFileName}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getSortIcon = (column) => {
        if (sortColumn !== column) return <i className="fas fa-sort text-gray-400 ml-1"></i>;
        return sortDirection === 'asc' 
            ? <i className="fas fa-sort-up text-primary ml-1"></i>
            : <i className="fas fa-sort-down text-primary ml-1"></i>;
    };

    // Mobile card view
    const MobileCardView = () => (
        <div className="space-y-3">
            {currentItems.map((row, idx) => (
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
            ))}
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
                    {exportable && (
                        <button onClick={exportToCSV} className="btn-outline btn-small">
                            <i className="fas fa-download mr-2"></i> Export
                        </button>
                    )}
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