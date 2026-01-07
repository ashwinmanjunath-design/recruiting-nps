import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface CohortData {
  id: string;
  name: string;
  percentage: number;
  count: number;
  color: string;
  coordinates: [number, number];
}

interface CohortAnalysisCardProps {
  cohorts?: CohortData[];
}

export default function CohortAnalysisCard({ cohorts }: CohortAnalysisCardProps) {
  // Default cohort data
  const defaultCohorts: CohortData[] = cohorts || [
    {
      id: 'tech-hires',
      name: 'Tech Hires',
      percentage: 2.9,
      count: 180,
      color: '#14b8a6',
      coordinates: [-100, 40],
    },
    {
      id: 'sales-hires',
      name: 'Sales Hires',
      percentage: 2.8,
      count: 198,
      color: '#f59e0b',
      coordinates: [10, 50],
    },
    {
      id: 'product-hires',
      name: 'Product Hires',
      percentage: 3.6,
      count: 1598,
      color: '#ef4444',
      coordinates: [80, 20],
    },
  ];

  return (
    <div className="card p-4 sm:p-6">
      {/* Card Title */}
      <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">Cohort Analysis</h3>

      {/* Map Container - Responsive height */}
      <div 
        className="bg-gradient-to-b from-slate-50/80 to-slate-100/80 rounded-lg overflow-hidden mb-4"
        style={{ height: '220px' }}
        // Tablet and desktop
        // style on larger screens
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 140,
            center: [10, 20]
          }}
          style={{
            width: '100%',
            height: '100%'
          }}
        >
          {/* Countries */}
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#e8eef0"
                  stroke="#d1dce0"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#e8eef0' },
                    pressed: { outline: 'none' }
                  }}
                />
              ))
            }
          </Geographies>

          {/* Cohort Markers */}
          {defaultCohorts.map((cohort) => (
            <Marker key={cohort.id} coordinates={cohort.coordinates}>
              <circle
                r={7}
                fill={cohort.color}
                stroke="#ffffff"
                strokeWidth={1.5}
                opacity={0.9}
                style={{ cursor: 'pointer' }}
              />
            </Marker>
          ))}
        </ComposableMap>
      </div>

      {/* Legend - Responsive (horizontal on desktop, can wrap on mobile) */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 border-t border-gray-100">
        {defaultCohorts.map((cohort) => (
          <div key={cohort.id} className="flex items-center gap-2">
            {/* Color dot */}
            <div 
              className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
              style={{ backgroundColor: cohort.color }}
            />
            {/* Text */}
            <span className="text-xs text-gray-600">
              <span className="font-medium">{cohort.name}</span>
              {' '}
              <span className="text-gray-500">
                {cohort.percentage}% ({cohort.count.toLocaleString()})
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
