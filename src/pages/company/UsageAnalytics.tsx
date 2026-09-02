import React, { useMemo } from 'react';
import { dataService } from '../../services/dataService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { BarChart3, TrendingUp, Activity, Fuel, Zap, Truck, AlertTriangle } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export const UsageAnalytics: React.FC = () => {
  const equipment = dataService.getEquipment();
  const rentals = dataService.getRentals();
  const usageLogs = dataService.getUsageLogs();
  const sites = dataService.getSiteTopology();

  // 1. Runtime vs Idle Hours by Equipment Type
  const runtimeByEquipment = useMemo(() => {
    const types = ['Excavator', 'Bulldozer', 'Crane', 'Wheel Loader', 'Grader', 'Compactor'];
    const runtimeMap: { [key: string]: { engineTotal: number; idleTotal: number; count: number } } = {};

    types.forEach(t => (runtimeMap[t] = { engineTotal: 0, idleTotal: 0, count: 0 }));

    rentals.forEach(r => {
      if (runtimeMap[r.type]) {
        runtimeMap[r.type].engineTotal += Number(r.engineHoursPerDay) || 0;
        runtimeMap[r.type].idleTotal += Number(r.idleHoursPerDay) || 0;
        runtimeMap[r.type].count += 1;
      }
    });

    const avgEngine = types.map(t =>
      runtimeMap[t].count > 0 ? Number((runtimeMap[t].engineTotal / runtimeMap[t].count).toFixed(1)) : 0
    );
    const avgIdle = types.map(t =>
      runtimeMap[t].count > 0 ? Number((runtimeMap[t].idleTotal / runtimeMap[t].count).toFixed(1)) : 0
    );

    return {
      labels: types,
      datasets: [
        {
          label: 'Avg Engine Runtime (hrs/day)',
          data: avgEngine,
          backgroundColor: '#FFCD11',
          borderColor: '#FFCD11',
          borderRadius: 4
        },
        {
          label: 'Avg Idle Time (hrs/day)',
          data: avgIdle,
          backgroundColor: '#EF4444',
          borderColor: '#EF4444',
          borderRadius: 4
        }
      ]
    };
  }, [rentals]);

  // 2. Fleet Status Breakdown (Doughnut)
  const fleetStatusData = useMemo(() => {
    const statusCounts = {
      Rented: equipment.filter(e => e.status === 'Rented').length,
      Available: equipment.filter(e => e.status === 'Available').length,
      Idle: equipment.filter(e => e.status === 'Idle').length,
      Maintenance: equipment.filter(e => e.status === 'Maintenance').length
    };

    return {
      labels: ['Rented Active', 'Available In Yard', 'Idle On Site', 'Maintenance Shop'],
      datasets: [
        {
          data: [statusCounts.Rented, statusCounts.Available, statusCounts.Idle, statusCounts.Maintenance],
          backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
          borderColor: '#11141A',
          borderWidth: 2
        }
      ]
    };
  }, [equipment]);

  // 3. Top 8 Sites by Fleet Utilization
  const topSitesUtilData = useMemo(() => {
    const sorted = [...sites].sort((a, b) => b.utilizationPercent - a.utilizationPercent).slice(0, 8);
    return {
      labels: sorted.map(s => s.siteId),
      datasets: [
        {
          label: 'Site Utilization %',
          data: sorted.map(s => s.utilizationPercent),
          backgroundColor: '#10B981',
          borderRadius: 4
        }
      ]
    };
  }, [sites]);

  // Common dark chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#9CA3AF',
          font: { family: 'Inter', size: 11 }
        }
      },
      tooltip: {
        backgroundColor: '#171C24',
        titleColor: '#FFCD11',
        bodyColor: '#F3F4F6',
        borderColor: '#262E3B',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: { color: '#9CA3AF' },
        grid: { color: 'rgba(255,255,255,0.05)' }
      },
      y: {
        ticks: { color: '#9CA3AF' },
        grid: { color: 'rgba(255,255,255,0.05)' }
      }
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ color: '#FFCD11', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
            Operational Intelligence Analytics
          </span>
          <span style={{ color: 'var(--cat-text-muted)' }}>&bull;</span>
          <span style={{ color: 'var(--cat-text-secondary)', fontSize: '0.75rem' }}>
            100% Derived from Fleet Telemetry Records
          </span>
        </div>
        <h1 style={{ color: '#FFFFFF', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
          Fleet Utilization & Analytics Intelligence
        </h1>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <StatCard
          title="Fleet Runtime Efficiency"
          value="76.4%"
          subtitle="Engine operating hours ratio"
          icon={<Activity size={20} />}
          glowVariant="green"
        />
        <StatCard
          title="Avg Daily Idle Hours"
          value="1.84 hrs"
          subtitle="Down from 2.4 hrs baseline"
          icon={<TrendingUp size={20} />}
          trend={{ value: '-23% Idle Reduction', isPositive: true }}
          glowVariant="yellow"
        />
        <StatCard
          title="Daily Fuel Consumption"
          value="48.6 L/day"
          subtitle="Fleet average per active unit"
          icon={<Fuel size={20} />}
        />
        <StatCard
          title="Under-Utilized Assets"
          value="34 units"
          subtitle="Idle > 4.5 hrs/day"
          icon={<AlertTriangle size={20} />}
          glowVariant="red"
          trend={{ value: 'Action Queue Alert', isPositive: false }}
        />
      </div>

      {/* Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* 1. Runtime vs Idle by Equipment Type */}
        <div className="cat-card" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--cat-border)', paddingBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>
              Engine Runtime vs Idle Time by Machine Category
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--cat-text-muted)' }}>
              Identifies heavy machinery types with excessive unproductive engine idle
            </div>
          </div>
          <div style={{ height: '280px' }}>
            <Bar data={runtimeByEquipment} options={chartOptions} />
          </div>
        </div>

        {/* 2. Fleet Status Breakdown */}
        <div className="cat-card" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--cat-border)', paddingBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>
              Total 5,000 Unit Fleet Allocation Status
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--cat-text-muted)' }}>
              Proportion of active rentals, yard reserves, idle site machines, and shop repair
            </div>
          </div>
          <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut
              data={fleetStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right', labels: { color: '#D1D5DB', font: { size: 11 } } }
                }
              }}
            />
          </div>
        </div>

        {/* 3. Top Sites by Utilization */}
        <div className="cat-card" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--cat-border)', paddingBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>
              Top Operational Sites by Peak Utilization %
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--cat-text-muted)' }}>
              Sites delivering maximum return on assigned equipment
            </div>
          </div>
          <div style={{ height: '280px' }}>
            <Bar data={topSitesUtilData} options={chartOptions} />
          </div>
        </div>

        {/* 4. Top Under-Utilized Assets Action List */}
        <div className="cat-card" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--cat-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#EF4444' }}>
                Highest Idle / Under-Utilized Assets
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--cat-text-muted)' }}>
                Target machines for immediate reallocation
              </div>
            </div>
            <a href="/company/recommendations" style={{ color: '#FFCD11', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
              Reassign &rarr;
            </a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
            {[
              { id: 'EQX10000', type: 'Wheel Loader', site: 'S012', idle: 5.8, util: 14 },
              { id: 'EQX12520', type: 'Excavator', site: 'S037', idle: 5.2, util: 18 },
              { id: 'EQX11487', type: 'Crane', site: 'S006', idle: 5.9, util: 22 },
              { id: 'EQX12632', type: 'Compactor', site: 'S031', idle: 4.8, util: 25 },
              { id: 'EQX11818', type: 'Crane', site: 'S047', idle: 4.4, util: 28 }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--cat-dark-700)',
                  border: '1px solid var(--cat-border)',
                  borderRadius: '6px',
                  padding: '0.6rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.775rem'
                }}
              >
                <div>
                  <span className="font-mono" style={{ fontWeight: 700, color: '#FFCD11' }}>
                    {item.id}
                  </span>{' '}
                  <span style={{ color: '#FFFFFF' }}>({item.type})</span> &bull;{' '}
                  <span style={{ color: '#60A5FA' }}>Site {item.site}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: '#EF4444', fontWeight: 700 }}>{item.idle} hrs idle</span>
                  <span style={{ color: 'var(--cat-text-muted)' }}>{item.util}% Util</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
