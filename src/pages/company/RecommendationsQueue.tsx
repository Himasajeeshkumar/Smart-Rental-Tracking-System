import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/dataService';
import { RecommendationAction } from '../../types';
import { Badge } from '../../components/common/Badge';
import confetti from 'canvas-confetti';
import {
  Zap,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Truck,
  RotateCcw,
  UserCheck,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export const RecommendationsQueue: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationAction[]>(dataService.getRecommendations());

  useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setRecommendations([...dataService.getRecommendations()]);
    });
    return unsub;
  }, []);

  const handleExecute = (id: string) => {
    const success = dataService.executeRecommendation(id);
    if (success) {
      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } catch {}
    }
  };

  const pendingCount = recommendations.filter(r => !r.executed).length;
  const executedCount = recommendations.filter(r => r.executed).length;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ color: '#FFCD11', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Data &rarr; Insight &rarr; Action Engine
          </span>
          <span style={{ color: 'var(--cat-text-muted)' }}>&bull;</span>
          <span style={{ color: 'var(--cat-text-secondary)', fontSize: '0.75rem' }}>
            Quantified Operational Benefit Dispatch
          </span>
        </div>
        <h1 style={{ color: '#FFFFFF', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
          Operational Recommendations & Action Queue
        </h1>
      </div>

      {/* Overview Banner */}
      <div
        className="cat-card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          backgroundColor: 'var(--cat-dark-700)'
        }}
      >
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.25rem' }}>
            {pendingCount} Pending Operational Optimization Actions
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--cat-text-secondary)' }}>
            Each recommendation connects raw telemetry signals directly to measurable fleet outcomes.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '0.5rem 1rem', backgroundColor: 'var(--cat-dark-800)', borderRadius: '6px', border: '1px solid var(--cat-border)' }}>
            <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFCD11' }}>
              {pendingCount}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>
              Pending
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '0.5rem 1rem', backgroundColor: 'var(--cat-dark-800)', borderRadius: '6px', border: '1px solid var(--cat-border)' }}>
            <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34D399' }}>
              {executedCount}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>
              Executed
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards Queue */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {recommendations.map(rec => (
          <div
            key={rec.id}
            className={`cat-card ${rec.executed ? '' : 'cat-card-glow-yellow'}`}
            style={{
              padding: '1.5rem',
              backgroundColor: rec.executed ? 'rgba(17, 20, 26, 0.6)' : 'var(--cat-dark-800)',
              borderColor: rec.executed ? 'rgba(16, 185, 129, 0.4)' : undefined,
              opacity: rec.executed ? 0.85 : 1
            }}
          >
            {/* Top Card Bar */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                marginBottom: '1rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--cat-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="font-mono" style={{ color: '#FFCD11', fontWeight: 800, fontSize: '0.85rem' }}>
                  {rec.id}
                </span>
                <Badge variant={rec.category === 'Reassign' ? 'idle' : rec.category === 'Return' ? 'critical' : 'active'}>
                  {rec.category}
                </Badge>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  {rec.title}
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="font-mono" style={{ color: '#60A5FA', fontSize: '0.8rem', fontWeight: 600 }}>
                  {rec.equipmentId} ({rec.equipmentType})
                </span>
                <span style={{ color: 'var(--cat-text-muted)' }}>&bull;</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-secondary)' }}>
                  From Site {rec.sourceSiteId} {rec.targetSiteId ? `→ Site ${rec.targetSiteId}` : ''}
                </span>
              </div>
            </div>

            {/* 4-Step Value Chain (SIGNAL -> INSIGHT -> ACTION -> BENEFIT) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.25rem'
              }}
            >
              {/* Step 1: Signal */}
              <div style={{ backgroundColor: 'var(--cat-dark-900)', padding: '0.875rem', borderRadius: '6px', border: '1px solid var(--cat-border)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--cat-text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  1. Telemetry Signal
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--cat-text-secondary)', lineHeight: 1.35 }}>
                  {rec.signal}
                </div>
              </div>

              {/* Step 2: Insight */}
              <div style={{ backgroundColor: 'var(--cat-dark-900)', padding: '0.875rem', borderRadius: '6px', border: '1px solid var(--cat-border)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#60A5FA', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  2. Operational Insight
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--cat-text-primary)', lineHeight: 1.35 }}>
                  {rec.insight}
                </div>
              </div>

              {/* Step 3: Action */}
              <div style={{ backgroundColor: 'var(--cat-dark-900)', padding: '0.875rem', borderRadius: '6px', border: '1px solid var(--cat-border)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#FFCD11', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  3. Action to Take
                </div>
                <div style={{ fontSize: '0.775rem', color: '#FFFFFF', fontWeight: 600, lineHeight: 1.35 }}>
                  {rec.actionText}
                </div>
              </div>

              {/* Step 4: Quantified Benefit */}
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '0.875rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#34D399', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  4. Expected Operational Benefit
                </div>
                <div style={{ fontSize: '0.775rem', color: '#34D399', fontWeight: 700, lineHeight: 1.35 }}>
                  {rec.expectedOutcome}
                </div>
              </div>
            </div>

            {/* Execution Trigger */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              {rec.executed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34D399', fontSize: '0.85rem', fontWeight: 700 }}>
                  <CheckCircle2 size={18} />
                  <span>Action Executed & Fleet Updated</span>
                </div>
              ) : (
                <button
                  onClick={() => handleExecute(rec.id)}
                  className="cat-btn-primary"
                  style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem' }}
                >
                  <Zap size={16} />
                  <span>{rec.actionText}</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
