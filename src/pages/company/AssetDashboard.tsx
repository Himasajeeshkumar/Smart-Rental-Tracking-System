import React, { useState, useMemo, useEffect } from 'react';
import { dataService } from '../../services/dataService';
import { Equipment, RentalTransaction, Operator, SiteLocation } from '../../types';
import { Badge } from '../../components/common/Badge';
import { DynamicSiteMap } from '../../components/common/DynamicSiteMap';
import {
  Search,
  Filter,
  Truck,
  Eye,
  X,
  MapPin,
  User,
  Calendar,
  Gauge,
  AlertTriangle,
  Zap,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Fuel
} from 'lucide-react';

interface AssetDashboardProps {
  onNavigate: (path: string) => void;
}

export const AssetDashboard: React.FC<AssetDashboardProps> = ({ onNavigate }) => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(dataService.getEquipment());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSite, setSelectedSite] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Selected Equipment for Drawer
  const [selectedAsset, setSelectedAsset] = useState<Equipment | null>(null);

  useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setEquipmentList([...dataService.getEquipment()]);
    });
    return unsub;
  }, []);

  // Filter list
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter(eq => {
      const matchSearch =
        eq.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.siteId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = selectedType === 'ALL' || eq.type === selectedType;
      const matchStatus = selectedStatus === 'ALL' || eq.status === selectedStatus;
      const matchSite = selectedSite === 'ALL' || eq.siteId === selectedSite;

      return matchSearch && matchType && matchStatus && matchSite;
    });
  }, [equipmentList, searchQuery, selectedType, selectedStatus, selectedSite]);

  const totalPages = Math.ceil(filteredEquipment.length / pageSize);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEquipment.slice(start, start + pageSize);
  }, [filteredEquipment, currentPage]);

  // Drawer details for selected asset
  const assetDetails = useMemo(() => {
    if (!selectedAsset) return null;
    const rental = dataService.getActiveRentalByEquipmentId(selectedAsset.id);
    const site = dataService.getSiteById(selectedAsset.siteId);
    const operator = rental ? dataService.getOperatorById(rental.lastOperatorId) : undefined;
    const usageLogs = dataService.getUsageLogsByEquipmentId(selectedAsset.id);

    return {
      equipment: selectedAsset,
      rental,
      site,
      operator,
      usageLogs
    };
  }, [selectedAsset]);

  const equipmentTypes = ['ALL', 'Excavator', 'Bulldozer', 'Crane', 'Wheel Loader', 'Grader', 'Compactor'];
  const statuses = ['ALL', 'Rented', 'Available', 'Idle', 'Maintenance'];
  const sites = ['ALL', ...Array.from({ length: 50 }, (_, i) => `S${String(i + 1).padStart(3, '0')}`)];

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ color: '#FFCD11', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Equipment Catalog & Telemetry
          </span>
          <span style={{ color: 'var(--cat-text-muted)' }}>&bull;</span>
          <span style={{ color: 'var(--cat-text-secondary)', fontSize: '0.75rem' }}>
            {filteredEquipment.length.toLocaleString()} matching units of 5,000 total
          </span>
        </div>
        <h1 style={{ color: '#FFFFFF', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
          Asset Inventory & Operations Dashboard
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
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 250px', minWidth: '220px' }}>
          <input
            type="text"
            className="cat-input"
            placeholder="Search Equipment ID, Model, Site..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={16} color="#6B7280" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* Dropdowns */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: '2 1 450px' }}>
          {/* Equipment Type */}
          <select
            className="cat-select"
            value={selectedType}
            onChange={e => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            style={{ flex: 1, minWidth: '130px' }}
          >
            {equipmentTypes.map(t => (
              <option key={t} value={t}>
                {t === 'ALL' ? 'All Machine Types' : t}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            className="cat-select"
            value={selectedStatus}
            onChange={e => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            style={{ flex: 1, minWidth: '130px' }}
          >
            {statuses.map(s => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Statuses' : s}
              </option>
            ))}
          </select>

          {/* Site */}
          <select
            className="cat-select font-mono"
            value={selectedSite}
            onChange={e => {
              setSelectedSite(e.target.value);
              setCurrentPage(1);
            }}
            style={{ flex: 1, minWidth: '120px' }}
          >
            {sites.map(s => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All 50 Sites' : `Site ${s}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="cat-table-wrapper" style={{ marginBottom: '1.25rem' }}>
        <table className="cat-table">
          <thead>
            <tr>
              <th>Equipment ID</th>
              <th>Type</th>
              <th>Model</th>
              <th>Site ID</th>
              <th>Status</th>
              <th>Ownership</th>
              <th>Active Rental</th>
              <th>Operator</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(eq => {
              const rental = dataService.getActiveRentalByEquipmentId(eq.id);
              return (
                <tr key={eq.id}>
                  <td>
                    <span className="font-mono" style={{ fontWeight: 700, color: '#FFCD11' }}>
                      {eq.id}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{eq.type}</td>
                  <td style={{ color: 'var(--cat-text-secondary)' }}>{eq.model}</td>
                  <td>
                    <span className="font-mono" style={{ color: '#60A5FA', fontWeight: 600 }}>
                      {eq.siteId}
                    </span>
                  </td>
                  <td>
                    <Badge variant={eq.status.toLowerCase() as any}>
                      {eq.status}
                    </Badge>
                  </td>
                  <td style={{ color: 'var(--cat-text-muted)', fontSize: '0.75rem' }}>{eq.ownershipType}</td>
                  <td>
                    {rental ? (
                      <span className="font-mono" style={{ fontSize: '0.75rem', color: '#34D399' }}>
                        {rental.rentalId} ({rental.utilizationPercent}%)
                      </span>
                    ) : (
                      <span style={{ color: 'var(--cat-text-muted)', fontSize: '0.75rem' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    {rental?.lastOperatorId ? (
                      <span className="font-mono" style={{ fontSize: '0.75rem', color: '#D1D5DB' }}>
                        {rental.lastOperatorId}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--cat-text-muted)', fontSize: '0.75rem' }}>—</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedAsset(eq)}
                      className="cat-btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.725rem' }}
                    >
                      <Eye size={13} color="#FFCD11" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
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
          Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredEquipment.length)} of {filteredEquipment.length} units
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

      {/* Slide-Over Asset Detail Drawer: WHO, WHAT, WHERE, WHEN, USAGE, STATUS, ISSUES, RECOMMENDED ACTIONS */}
      {selectedAsset && assetDetails && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(5px)',
            zIndex: 200,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
          onClick={() => setSelectedAsset(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '650px',
              height: '100vh',
              backgroundColor: 'var(--cat-dark-800)',
              borderLeft: '1px solid var(--cat-border)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--cat-border)',
                backgroundColor: 'var(--cat-dark-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 10
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFCD11' }}>
                    {selectedAsset.id}
                  </span>
                  <Badge variant={selectedAsset.status.toLowerCase() as any}>
                    {selectedAsset.status}
                  </Badge>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 600 }}>
                  {selectedAsset.type} &bull; {selectedAsset.model} ({selectedAsset.manufactureYear || '2025'})
                </div>
              </div>

              <button
                onClick={() => setSelectedAsset(null)}
                style={{
                  background: 'var(--cat-dark-800)',
                  border: '1px solid var(--cat-border)',
                  color: 'var(--cat-text-secondary)',
                  borderRadius: '6px',
                  padding: '0.4rem',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* 1. WHO & WHAT */}
              <div className="cat-card" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFCD11', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  1. Operator & Machine Specification
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: 'var(--cat-text-muted)', display: 'block', fontSize: '0.7rem' }}>Assigned Operator</span>
                    <strong style={{ color: '#FFFFFF' }}>
                      {assetDetails.operator ? `${assetDetails.operator.name} (${assetDetails.operator.operatorId})` : assetDetails.rental?.lastOperatorId || 'Unassigned'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--cat-text-muted)', display: 'block', fontSize: '0.7rem' }}>Operator Certification</span>
                    <strong style={{ color: '#FFFFFF' }}>
                      {assetDetails.operator?.certificationLevel || 'Standard Certified'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--cat-text-muted)', display: 'block', fontSize: '0.7rem' }}>Ownership Type</span>
                    <strong style={{ color: '#FFFFFF' }}>{selectedAsset.ownershipType}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--cat-text-muted)', display: 'block', fontSize: '0.7rem' }}>Machine Model</span>
                    <strong style={{ color: '#FFFFFF' }}>{selectedAsset.model}</strong>
                  </div>
                </div>
              </div>

              {/* 2. WHERE & WHEN */}
              <div className="cat-card" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFCD11', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  2. Operational Site & Rental Timeline
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ color: 'var(--cat-text-muted)', display: 'block', fontSize: '0.7rem' }}>Assigned Site</span>
                    <strong style={{ color: '#60A5FA' }}>
                      {assetDetails.site ? assetDetails.site.name : `Site ${selectedAsset.siteId}`}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--cat-text-muted)', display: 'block', fontSize: '0.7rem' }}>Site Location / Region</span>
                    <strong style={{ color: '#FFFFFF' }}>{assetDetails.site?.location || 'Regional Zone'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--cat-text-muted)', display: 'block', fontSize: '0.7rem' }}>Check-Out Date</span>
                    <strong style={{ color: '#FFFFFF' }}>{assetDetails.rental?.checkOutDate || 'Not Checked Out'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--cat-text-muted)', display: 'block', fontSize: '0.7rem' }}>Expected Return Date</span>
                    <strong style={{ color: assetDetails.rental?.status === 'Overdue' ? '#EF4444' : '#FFFFFF' }}>
                      {assetDetails.rental?.expectedReturnDate || 'N/A'}
                    </strong>
                  </div>
                </div>

                {/* Site Mini Map */}
                {assetDetails.site && (
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--cat-text-muted)', marginBottom: '0.35rem' }}>
                      Site Map Location:
                    </div>
                    <DynamicSiteMap site={assetDetails.site} assignedEquipment={[selectedAsset]} height="180px" />
                  </div>
                )}
              </div>

              {/* 3. HOW MUCH USED (Telemetry & Hours) */}
              <div className="cat-card" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFCD11', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  3. Telemetry & Utilization Rates
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
                  <div style={{ backgroundColor: 'var(--cat-dark-900)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--cat-border)' }}>
                    <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34D399' }}>
                      {assetDetails.rental?.engineHoursPerDay || 6.8}h
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--cat-text-muted)', marginTop: '2px' }}>Engine Hrs / Day</div>
                  </div>

                  <div style={{ backgroundColor: 'var(--cat-dark-900)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--cat-border)' }}>
                    <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FBBF24' }}>
                      {assetDetails.rental?.idleHoursPerDay || 1.4}h
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--cat-text-muted)', marginTop: '2px' }}>Idle Hrs / Day</div>
                  </div>

                  <div style={{ backgroundColor: 'var(--cat-dark-900)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--cat-border)' }}>
                    <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFCD11' }}>
                      {assetDetails.rental?.utilizationPercent || 82}%
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--cat-text-muted)', marginTop: '2px' }}>Utilization Rate</div>
                  </div>
                </div>
              </div>

              {/* 4. IS THERE AN ISSUE & WHAT OPERATIONS SHOULD DO */}
              <div
                style={{
                  backgroundColor: selectedAsset.status === 'Idle' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  border: `1px solid ${selectedAsset.status === 'Idle' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                  borderRadius: '8px',
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Zap size={16} color={selectedAsset.status === 'Idle' ? '#F59E0B' : '#10B981'} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase' }}>
                    Recommended Operations Action
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--cat-text-secondary)', margin: '0 0 0.75rem 0', lineHeight: 1.4 }}>
                  {selectedAsset.status === 'Idle'
                    ? `Equipment is currently idle at ${selectedAsset.siteId}. Recommend cross-site transfer to high-demand project (e.g. S003) to eliminate idle loss.`
                    : selectedAsset.status === 'Rented'
                    ? `Machine is actively operating on contract. Monitor daily idle hours threshold (<2.5h/day) to sustain >80% utilization.`
                    : `Machine is available in fleet inventory. Ready for immediate dispatch upon new rental request.`}
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setSelectedAsset(null);
                      onNavigate('/company/checkin-checkout');
                    }}
                    className="cat-btn-primary"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                  >
                    <span>Check-In / Out Machine</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAsset(null);
                      onNavigate('/company/recommendations');
                    }}
                    className="cat-btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                  >
                    <span>View Action Queue</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
