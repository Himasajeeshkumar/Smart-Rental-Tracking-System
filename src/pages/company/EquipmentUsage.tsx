import React, { useState, useMemo } from 'react';
import { dataService } from '../../services/dataService';
import { RentalTransaction } from '../../types';
import { Badge } from '../../components/common/Badge';
import {
  Search,
  Filter,
  Gauge,
  Fuel,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Activity,
  Zap
} from 'lucide-react';

export const EquipmentUsage: React.FC = () => {
  const [rentals, setRentals] = useState<RentalTransaction[]>(dataService.getRentals());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const filteredRentals = useMemo(() => {
    return rentals.filter(r => {
      const matchSearch =
        r.equipmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.rentalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.siteId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.lastOperatorId && r.lastOperatorId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = selectedType === 'ALL' || r.type === selectedType;
      const matchStatus = selectedStatus === 'ALL' || r.status === selectedStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [rentals, searchQuery, selectedType, selectedStatus]);

  const totalPages = Math.ceil(filteredRentals.length / pageSize);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRentals.slice(start, start + pageSize);
  }, [filteredRentals, currentPage]);

  const equipmentTypes = ['ALL', 'Excavator', 'Bulldozer', 'Crane', 'Wheel Loader', 'Grader', 'Compactor'];
  const statuses = ['ALL', 'Active', 'Overdue', 'Returned'];

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ color: '#FFCD11', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Heavy Machinery Telemetry
          </span>
          <span style={{ color: 'var(--cat-text-muted)' }}>&bull;</span>
          <span style={{ color: 'var(--cat-text-secondary)', fontSize: '0.75rem' }}>
            {filteredRentals.length.toLocaleString()} Tracked Rental Transactions
          </span>
        </div>
        <h1 style={{ color: '#FFFFFF', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
          Equipment Usage & Operating Conditions
        </h1>
      </div>

      {/* Filter Toolbar */}
      <div
        className="cat-card"
        style={{
          padding: '1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 250px', minWidth: '220px' }}>
          <input
            type="text"
            className="cat-input"
            placeholder="Search Rental ID, Machine, Site, Operator..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={16} color="#6B7280" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            className="cat-select"
            value={selectedType}
            onChange={e => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: '160px' }}
          >
            {equipmentTypes.map(t => (
              <option key={t} value={t}>
                {t === 'ALL' ? 'All Equipment' : t}
              </option>
            ))}
          </select>

          <select
            className="cat-select"
            value={selectedStatus}
            onChange={e => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: '140px' }}
          >
            {statuses.map(s => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Statuses' : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Usage Table */}
      <div className="cat-table-wrapper" style={{ marginBottom: '1.25rem' }}>
        <table className="cat-table">
          <thead>
            <tr>
              <th>Rental ID</th>
              <th>Equipment ID</th>
              <th>Type</th>
              <th>Site ID</th>
              <th>Operator ID</th>
              <th>Engine Hrs/Day</th>
              <th>Idle Hrs/Day</th>
              <th>Operating Days</th>
              <th>Fuel (L/Day)</th>
              <th>Utilization %</th>
              <th>Status</th>
              <th>Check-Out Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(r => (
              <tr key={r.rentalId}>
                <td>
                  <span className="font-mono" style={{ fontWeight: 700, color: '#FFFFFF' }}>
                    {r.rentalId}
                  </span>
                </td>
                <td>
                  <span className="font-mono" style={{ fontWeight: 700, color: '#FFCD11' }}>
                    {r.equipmentId}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{r.type}</td>
                <td>
                  <span className="font-mono" style={{ color: '#60A5FA', fontWeight: 600 }}>
                    {r.siteId}
                  </span>
                </td>
                <td>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: '#D1D5DB' }}>
                    {r.lastOperatorId || 'Unassigned'}
                  </span>
                </td>
                <td>
                  <span className="font-mono" style={{ fontWeight: 700, color: '#34D399' }}>
                    {r.engineHoursPerDay}h
                  </span>
                </td>
                <td>
                  <span
                    className="font-mono"
                    style={{
                      fontWeight: 700,
                      color: r.idleHoursPerDay > 4 ? '#EF4444' : r.idleHoursPerDay > 2 ? '#F59E0B' : '#D1D5DB'
                    }}
                  >
                    {r.idleHoursPerDay}h
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>{r.operatingDays}d</td>
                <td>
                  <span className="font-mono" style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                    {r.fuelUsagePerDay} L
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div
                      style={{
                        width: '45px',
                        height: '6px',
                        backgroundColor: 'var(--cat-dark-600)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, r.utilizationPercent)}%`,
                          height: '100%',
                          backgroundColor:
                            r.utilizationPercent >= 75
                              ? '#10B981'
                              : r.utilizationPercent >= 50
                              ? '#FFCD11'
                              : '#EF4444'
                        }}
                      />
                    </div>
                    <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.75rem' }}>
                      {r.utilizationPercent}%
                    </span>
                  </div>
                </td>
                <td>
                  <Badge variant={r.status.toLowerCase() as any}>
                    {r.status}
                  </Badge>
                </td>
                <td style={{ color: 'var(--cat-text-muted)', fontSize: '0.75rem' }}>
                  {r.checkOutDate || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '0.5rem 0'
        }}
      >
        <div style={{ fontSize: '0.8rem', color: 'var(--cat-text-muted)' }}>
          Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredRentals.length)} of {filteredRentals.length} transactions
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="cat-btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
          >
            <ChevronLeft size={14} />
            <span>Previous</span>
          </button>
          <span className="font-mono" style={{ fontSize: '0.8rem', padding: '0 0.5rem', color: '#FFFFFF' }}>
            Page {currentPage} of {Math.max(1, totalPages)}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="cat-btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
          >
            <span>Next</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
