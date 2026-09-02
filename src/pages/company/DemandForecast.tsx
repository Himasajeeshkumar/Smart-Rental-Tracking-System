import React, { useState, useMemo } from 'react';
import { dataService } from '../../services/dataService';
import { DemandForecast as ForecastType } from '../../types';
import { Badge } from '../../components/common/Badge';
import {
  TrendingUp,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ArrowRight,
  Truck,
  ShieldCheck,
  BrainCircuit
} from 'lucide-react';

interface DemandForecastProps {
  onNavigate: (path: string) => void;
}

export const DemandForecast: React.FC<DemandForecastProps> = ({ onNavigate }) => {
  const [forecasts] = useState<ForecastType[]>(dataService.getDemandForecasts());
  const [selectedSite, setSelectedSite] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [onlyGaps, setOnlyGaps] = useState(false);

  const filteredForecasts = useMemo(() => {
    return forecasts.filter(f => {
      const matchSite = selectedSite === 'ALL' || f.siteId === selectedSite;
      const matchType = selectedType === 'ALL' || f.equipmentType === selectedType;
      const matchGap = !onlyGaps || f.predictedGap > 0;
      return matchSite && matchType && matchGap;
    });
  }, [forecasts, selectedSite, selectedType, onlyGaps]);

  const totalDeficits = forecasts.filter(f => f.predictedGap > 0).length;
  const criticalDeficits = forecasts.filter(f => f.priority === 'Critical').length;

  const sites = ['ALL', ...Array.from({ length: 50 }, (_, i) => `S${String(i + 1).padStart(3, '0')}`)];
  const equipmentTypes = ['ALL', 'Excavator', 'Bulldozer', 'Crane', 'Wheel Loader', 'Grader', 'Compactor'];

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ color: '#FFCD11', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Predictive AI & Statistical Modeling
          </span>
          <span style={{ color: 'var(--cat-text-muted)' }}>&bull;</span>
          <span style={{ color: 'var(--cat-text-secondary)', fontSize: '0.75rem' }}>
            Derived from 6,000 Historical Demand Records
          </span>
        </div>
        <h1 style={{ color: '#FFFFFF', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
          Site Demand Forecasting & Pre-Positioning
        </h1>
      </div>

      {/* Summary KPI Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div className="cat-card cat-card-glow-red" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--cat-text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
            Critical Demand Deficits
          </div>
          <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#EF4444', margin: '0.25rem 0' }}>
            {criticalDeficits} Sites
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--cat-text-muted)' }}>
            Require urgent pre-positioning
          </div>
        </div>

        <div className="cat-card cat-card-glow-yellow" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--cat-text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Projected Gaps
          </div>
          <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFCD11', margin: '0.25rem 0' }}>
            {totalDeficits} Equipment Slots
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--cat-text-muted)' }}>
            Predicted over next 7-14 days
          </div>
        </div>

        <div className="cat-card cat-card-glow-green" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--cat-text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
            Forecast Model Confidence
          </div>
          <div className="font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34D399', margin: '0.25rem 0' }}>
            91.4%
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--cat-text-muted)' }}>
            Transparent time-series statistical model
          </div>
        </div>
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
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            className="cat-select font-mono"
            value={selectedSite}
            onChange={e => setSelectedSite(e.target.value)}
            style={{ width: '160px' }}
          >
            {sites.map(s => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All 50 Sites' : `Site ${s}`}
              </option>
            ))}
          </select>

          <select
            className="cat-select"
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            style={{ width: '160px' }}
          >
            {equipmentTypes.map(t => (
              <option key={t} value={t}>
                {t === 'ALL' ? 'All Machine Types' : t}
              </option>
            ))}
          </select>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#FFFFFF', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={onlyGaps}
            onChange={e => setOnlyGaps(e.target.checked)}
            style={{ accentColor: '#FFCD11' }}
          />
          <span>Show Only Deficits & Gaps (Action Needed)</span>
        </label>
      </div>

      {/* Forecast Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1rem'
        }}
      >
        {filteredForecasts.map((fc, idx) => (
          <div
            key={idx}
            className={`cat-card ${fc.predictedGap > 0 ? 'cat-card-glow-yellow' : ''}`}
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="font-mono" style={{ fontWeight: 800, color: '#FFCD11', fontSize: '0.9rem' }}>
                      {fc.siteId}
                    </span>
                    <Badge variant={fc.priority === 'Critical' ? 'critical' : fc.priority === 'High' ? 'idle' : 'active'}>
                      {fc.priority} Priority
                    </Badge>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {fc.siteName.split(' - ')[1] || fc.siteName}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--cat-text-muted)' }}>Confidence</span>
                  <div className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34D399' }}>
                    {fc.confidenceScore}%
                  </div>
                </div>
              </div>

              {/* Machine Type & Numbers */}
              <div
                style={{
                  backgroundColor: 'var(--cat-dark-900)',
                  border: '1px solid var(--cat-border)',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  marginBottom: '0.75rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  textAlign: 'center',
                  gap: '0.5rem'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>
                    Target Machine
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                    {fc.equipmentType}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>
                    Projected Need
                  </div>
                  <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFCD11' }}>
                    {fc.projectedDemandNextWeek} units
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>
                    Net Deficit
                  </div>
                  <div
                    className="font-mono"
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: fc.predictedGap > 0 ? '#EF4444' : '#10B981'
                    }}
                  >
                    {fc.predictedGap > 0 ? `-${fc.predictedGap}` : 'Balanced'}
                  </div>
                </div>
              </div>

              {/* Explainable Reasoning */}
              <div style={{ fontSize: '0.775rem', color: 'var(--cat-text-secondary)', lineHeight: 1.4, marginBottom: '1rem' }}>
                <strong style={{ color: '#D1D5DB' }}>Signals & Reasoning: </strong>
                {fc.reasoning}
              </div>
            </div>

            {/* Action Trigger */}
            <div style={{ borderTop: '1px solid var(--cat-border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--cat-text-muted)' }}>
                Available on site: <strong style={{ color: '#FFFFFF' }}>{fc.availableAtSite}</strong> units
              </span>

              {fc.predictedGap > 0 ? (
                <button
                  onClick={() => onNavigate('/company/recommendations')}
                  className="cat-btn-primary"
                  style={{ fontSize: '0.725rem', padding: '0.35rem 0.65rem' }}
                >
                  <Zap size={13} />
                  <span>Pre-Position Equipment</span>
                </button>
              ) : (
                <span style={{ fontSize: '0.725rem', color: '#34D399', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                  <CheckCircle2 size={13} />
                  <span>Optimal Fleet Balance</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
