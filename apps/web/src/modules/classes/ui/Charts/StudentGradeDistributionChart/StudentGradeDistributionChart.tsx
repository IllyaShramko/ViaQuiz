import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import type { StudentGradeDistributionChartProps } from './StudentGradeDistributionChart.types';
import styles from '../Charts.module.css';

export const StudentGradeDistributionChart: React.FC<StudentGradeDistributionChartProps> = ({
  labels,
  series,
  title = 'Розподіл оцінок',
}) => {
  if (!labels || labels.length === 0 || !series || series.length === 0 || series.every((s) => s === 0)) {
    return (
      <div className={styles['chart-card']}>
        <div className={styles['chart-header']}>
          <h3 className={styles['chart-title']}>{title}</h3>
        </div>
        <div className={styles['empty-chart']}>
          <svg className={styles['empty-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
          </svg>
          <p>Немає даних про оцінки для розподілу</p>
        </div>
      </div>
    );
  }

  // Generate pleasant vibrant colors for grades
  const colorPalette = [
    '#38bdf8', // light blue
    '#22c55e', // emerald green
    '#f59e0b', // amber
    '#863bff', // purple
    '#ec4899', // pink
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#f97316', // orange
    '#a855f7', // violet
    '#06b6d4', // cyan
  ];

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      background: 'transparent',
      animations: {
        enabled: true,
        speed: 600,
      },
    },
    colors: colorPalette.slice(0, labels.length),
    labels,
    stroke: {
      colors: ['#1a1a26'],
      width: 2,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          background: 'transparent',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '13px',
              color: '#9090a8',
              offsetY: -4,
            },
            value: {
              show: true,
              fontSize: '20px',
              fontWeight: '700',
              color: '#f0f0f5',
              offsetY: 4,
              formatter: (val) => `${val} тест.`,
            },
            total: {
              show: true,
              label: 'Всього тестів',
              color: '#9090a8',
              fontSize: '12px',
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return `${total}`;
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: 'right',
      horizontalAlign: 'center',
      fontSize: '13px',
      labels: {
        colors: '#f0f0f5',
      },
      markers: {
        size: 7,
      },
      itemMargin: {
        vertical: 4,
      },
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val) => `${val} раз(ів)`,
      },
    },
    theme: {
      mode: 'dark',
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  return (
    <div className={styles['chart-card']}>
      <div className={styles['chart-header']}>
        <div>
          <h3 className={styles['chart-title']}>{title}</h3>
          <span className={styles['chart-subtitle']}>Співвідношення отриманих балів</span>
        </div>
      </div>
      <div className={styles['chart-body']}>
        <Chart options={options} series={series} type="donut" height={280} width="100%" />
      </div>
    </div>
  );
};
