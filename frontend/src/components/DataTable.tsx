import React, { useMemo, useState } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
interface DataTableProps {
  columns: {
    id: string;
    header: string;
    cell: (item: any) => React.ReactNode;
    sortable?: boolean;
  }[];
  data: any[];
  pagination?: boolean;
  searchable?: boolean;
  itemsPerPage?: number;
}
const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  pagination = true,
  searchable = true,
  itemsPerPage = 10
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  // Filter data based on search query
  const filteredData = searchQuery ? data.filter(item => Object.values(item).some(value => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase()))) : data;
  // Sort data if sort config exists
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);
  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = pagination ? sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) : sortedData;
  // Request sort
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({
      key,
      direction
    });
  };
  // Get sort direction for a column
  const getSortDirection = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction;
  };
  return <div className="w-full">
      {/* Search */}
      {searchable && <div className="mb-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Tìm kiếm..." value={searchQuery} onChange={e => {
          setSearchQuery(e.target.value);
          setCurrentPage(1); // Reset to first page on search
        }} />
          </div>
        </div>}
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => <th key={column.id} scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && <button className="ml-2 focus:outline-none" onClick={() => requestSort(column.id)}>
                        {getSortDirection(column.id) === 'asc' ? <ChevronUp className="h-4 w-4" /> : getSortDirection(column.id) === 'desc' ? <ChevronDown className="h-4 w-4" /> : <div className="h-4 w-4 opacity-0">
                            <ChevronDown className="h-4 w-4" />
                          </div>}
                      </button>}
                  </div>
                </th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paginatedData.length > 0 ? paginatedData.map((item, index) => <tr key={index}>
                  {columns.map(column => <td key={column.id} className="whitespace-nowrap px-6 py-4">
                      {column.cell(item)}
                    </td>)}
                </tr>) : <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {pagination && totalPages > 1 && <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Trước
            </button>
            <button onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Sau
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị{' '}
                <span className="font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{' '}
                đến{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredData.length)}
                </span>{' '}
                của <span className="font-medium">{filteredData.length}</span>{' '}
                kết quả
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50">
                  <span className="sr-only">Trước</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {/* Page numbers */}
                {Array.from({
              length: Math.min(5, totalPages)
            }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
              return <button key={pageNumber} onClick={() => setCurrentPage(pageNumber)} className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${currentPage === pageNumber ? 'z-10 border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'}`}>
                        {pageNumber}
                      </button>;
            })}
                <button onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50">
                  <span className="sr-only">Sau</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>}
    </div>;
};
export default DataTable;