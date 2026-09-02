import React, { useState, useMemo, useEffect } from 'react';
import { dataService } from '../../services/dataService';
import { SiteLocation, Equipment } from '../../types';
import { Badge } from '../../components/common/Badge';
import { DynamicSiteMap } from '../../components/common/DynamicSiteMap';
import {
  MapPin,
  Search,
  Truck,
  Activity,
  PauseCircle,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Layers,
  Info
} from 'lucide-react';

interface SiteOperationsProps {
  onNavigate: (path: string) => void;
}

export const SiteOperations: React.FC<SiteOperationsProps> = ({ onNavigate }) => {
  const [siteTopology, setSiteTopology] = useState(dataService.getSiteTopology());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('S001');

  useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setSiteTopology(dataService.getSiteTopology());
    });
    return unsub;
  }, []);

  const filteredSites = useMemo(() => {
    return siteTopology.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.siteId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [siteTopology, searchQuery]);

  const selectedSite = useMemo(() => {
    return siteTopology.find(s => s.siteId === selectedSiteId) || siteTopology[0];
  }, [siteTopology, selectedSiteId]);

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ color: '#FFCD11', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Live Fleet & Site Operations Topology
          </span>
          <span style={{ color: 'var(--cat-text-muted)' }}>&bull;</span>
          <span style={{ color: 'var(--cat-text-secondary)', fontSize: '0.75rem' }}>
            50 Active Operational Hubs
          </span>
        </div>
        <h1 style={{ color: '#FFFFFF', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
          Site Hubs & Dynamic Geographic Fleet Map
        </h1>
      </div>

      {/* Main Two-Column / Responsive Stacked Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Site Directory Cards with Search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search Box */}
          <div className="cat-card" style={{ padding: '0.75rem 1rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="cat-input"
                placeholder="Search by Site ID, Name, Location..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Search
                size={16}
                color="#6B7280"
                style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          {/* Scrollable Site Cards List */}
          <div
            style={{
              maxHeight: 'calc(100vh - 240px)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              paddingRight: '4px'
            }}
          >
            {filteredSites.map(site => {
              const isSelected = site.siteId === selectedSiteId;
              return (
                <div
                  key={site.siteId}
                  onClick={() => setSelectedSiteId(site.siteId)}
                  className={`cat-card ${isSelected ? 'cat-card-glow-yellow' : 'cat-card-interactive'}`}
                  style={{
                    padding: '1rem',
                    cursor: 'pointer',
                    borderColor: isSelected ? '#FFCD11' : undefined,
                    backgroundColor: isSelected ? 'var(--cat-dark-700)' : 'var(--cat-dark-800)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="font-mono" style={{ fontWeight: 800, color: '#FFCD11', fontSize: '0.9rem' }}>
                        {site.siteId}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>
                        {site.category}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: site.utilizationPercent >= 75 ? '#34D399' : site.utilizationPercent >= 60 ? '#FBBF24' : '#F87171'
                      }}
                    >
                      {site.utilizationPercent}% Util
                    </span>
                  </div>

                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.25rem' }}>
                    {site.name.split(' - ')[1] || site.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cat-text-secondary)', marginBottom: '0.6rem' }}>
                    {site.location}
                  </div>

                  {/* Micro stats */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.7rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid rgba(38, 46, 59, 0.6)'
                    }}
                  >
                    <span style={{ color: 'var(--cat-text-secondary)' }}>
                      Total Assets: <strong style={{ color: '#FFFFFF' }}>{site.totalAssets}</strong>
                    </span>
                    <span style={{ color: 'var(--cat-text-secondary)' }}>
                      Active: <strong style={{ color: '#34D399' }}>{site.activeCount}</strong>
                    </span>
                    <span style={{ color: 'var(--cat-text-secondary)' }}>
                      Idle: <strong style={{ color: site.idleCount > 0 ? '#F59E0B' : '#FFFFFF' }}>{site.idleCount}</strong>
                    </span>
                    {site.overdueCount > 0 && (
                      <span style={{ color: '#EF4444', fontWeight: 700 }}>
                        {site.overdueCount} Overdue
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected SITE OPERATIONS PANEL + Dynamic Map */}
        {selectedSite && (
          <div
            className="cat-card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              position: 'sticky',
              top: '80px'
            }}
          >
            {/* Panel Header */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '0.75rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--cat-border)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="font-mono" style={{ backgroundColor: '#FFCD11', color: '#000000', fontWeight: 900, padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                    {selectedSite.siteId}
                  </span>
                  <span style={{ color: 'var(--cat-text-muted)', fontSize: '0.75rem' }}>{selectedSite.category}</span>
                </div>
                <h2 style={{ color: '#FFFFFF', fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                  {selectedSite.name}
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--cat-text-secondary)', marginTop: '2px' }}>
                  {selectedSite.location} &bull; <span className="font-mono" style={{ color: '#FFCD11' }}>{selectedSite.latitude.toFixed(4)}°, {selectedSite.longitude.toFixed(4)}°</span>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedSite.latitude},${selectedSite.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cat-btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
              >
                <span>Open in Google Maps</span>
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Metric Summary Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: '0.75rem'
              }}
            >
              <div style={{ backgroundColor: 'var(--cat-dark-900)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--cat-border)', textAlign: 'center' }}>
                <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34D399' }}>
                  {selectedSite.utilizationPercent}%
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>
                  Utilization
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--cat-dark-900)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--cat-border)', textAlign: 'center' }}>
                <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {selectedSite.totalAssets}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>
                  Total Machines
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--cat-dark-900)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--cat-border)', textAlign: 'center' }}>
                <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FBBF24' }}>
                  {selectedSite.idleCount}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>
                  Idle Units
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--cat-dark-900)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--cat-border)', textAlign: 'center' }}>
                <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: selectedSite.demandDeficit > 0 ? '#EF4444' : '#34D399' }}>
                  {selectedSite.demandDeficit > 0 ? `-${selectedSite.demandDeficit}` : 'Balanced'}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>
                  Demand Gap
                </div>
              </div>
            </div>

            {/* DYNAMIC REAL MAP FOR THAT PARTICULAR SITE */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: '#FFCD11', textTransform: 'uppercase' }}>
                  <MapPin size={14} />
                  <span>Site Dynamic Geographic Map ({selectedSite.siteId})</span>
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--cat-text-muted)' }}>
                  Auto-recentered on selection
                </span>
              </div>

              <DynamicSiteMap
                site={selectedSite}
                assignedEquipment={selectedSite.assignedEquipment}
                height="320px"
              />
            </div>

            {/* Assigned Machinery Sub-Table */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cat-text-secondary)', textTransform: 'uppercase' }}>
                  Assigned Machinery at {selectedSite.siteId} ({selectedSite.assignedEquipment.length} units)
                </div>
                <button
                  onClick={() => onNavigate('/company/assets')}
                  style={{ background: 'none', border: 'none', color: '#FFCD11', fontSize: '0.7rem', cursor: 'pointer' }}
                >
                  View in Asset Catalog &rarr;
                </button>
              </div>

              <div style={{ maxHeight: '180px', overflowY: 'auto', borderRadius: '6px', border: '1px solid var(--cat-border)' }}>
                <table className="cat-table" style={{ fontSize: '0.75rem' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Machine ID</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Type / Model</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Status</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSite.assignedEquipment.slice(0, 10).map(eq => (
                      <tr key={eq.id}>
                        <td style={{ padding: '0.4rem 0.75rem' }}>
                          <span className="font-mono" style={{ fontWeight: 700, color: '#FFCD11' }}>
                            {eq.id}
                          </span>
                        </td>
                        <td style={{ padding: '0.4rem 0.75rem' }}>
                          {eq.type} ({eq.model})
                        </td>
                        <td style={{ padding: '0.4rem 0.75rem' }}>
                          <Badge variant={eq.status.toLowerCase() as any} size="sm">
                            {eq.status}
                          </Badge>
                        </td>
                        <td style={{ padding: '0.4rem 0.75rem', color: 'var(--cat-text-muted)' }}>
                          {eq.manufactureYear || '2025'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
