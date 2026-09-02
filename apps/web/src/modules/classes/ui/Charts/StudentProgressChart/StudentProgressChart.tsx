import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import type { StudentProgressChartProps } from './StudentProgressChart.types';
import styles from '../Charts.module.css';

export const StudentProgressChart: React.FC<StudentProgressChartProps> = ({
  categories,
  grades,
  quizTitles = [],
  title = 'Прогрес успішності',
}) => {
  if (!categories || categories.length === 0 || !grades || grades.length === 0) {
    return (
      <div className={styles['chart-card']}>
        <div className={styles['chart-header']}>
          <h3 className={styles['chart-title']}>{title}</h3>
        </div>
        <div className={styles['empty-chart']}>
          <svg className={styles['empty-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <p>Немає даних для побудови графіка прогресу</p>
        </div>
      </div>
    );
  }

  const options: ApexOptions = {
    chart: {
      type: 'area',
      height: 280,
      background: 'transparent',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      animations: {
        enabled: true,
        speed: 600,
      },
    },
    colors: ['#863bff'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.05,
        stops: [0, 95, 100],
      },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    markers: {
      size: 5,
      colors: ['#863bff'],
      strokeColors: '#ffffff',
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
    grid: {
      borderColor: '#2a2a3a',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: '#9090a8',
          fontSize: '12px',
        },
      },
      axisBorder: {
        color: '#2a2a3a',
      },
      axisTicks: {
        color: '#2a2a3a',
      },
    },
    yaxis: {
      min: 0,
      max: 12,
      tickAmount: 6,
      labels: {
        style: {
          colors: '#9090a8',
          fontSize: '12px',
        },
        formatter: (val) => `${Math.round(val)}`,
      },
      title: {
        text: 'Оцінка (1-12)',
        style: {
          color: '#606078',
          fontSize: '11px',
        },
      },
    },
    tooltip: {
      theme: 'dark',
      custom: ({ series, seriesIndex, dataPointIndex }) => {
        const grade = series[seriesIndex][dataPointIndex];
        const date = categories[dataPointIndex];
        const quizName = quizTitles[dataPointIndex] || 'Тестування';
        return `
          <div style="background: #12121a; border: 1px solid #863bff; padding: 10px 14px; border-radius: 8px; font-family: inherit;">
            <div style="font-weight: 700; color: #f0f0f5; font-size: 13px; margin-bottom: 4px;">${quizName}</div>
            <div style="color: #9090a8; font-size: 12px; margin-bottom: 6px;">Дата: ${date}</div>
            <div style="color: #22c55e; font-weight: 600; font-size: 14px;">Оцінка: ${grade} / 12</div>
          </div>
        `;
      },
    },
    theme: {
      mode: 'dark',
    },
  };

  const series = [
    {
      name: 'Оцінка',
      data: grades,
    },
  ];

  return (
    <div className={styles['chart-card']}>
      <div className={styles['chart-header']}>
        <div>
          <h3 className={styles['chart-title']}>{title}</h3>
          <span className={styles['chart-subtitle']}>Динаміка оцінок учня за шкалою 1-12</span>
        </div>
      </div>
      <div className={styles['chart-body']}>
        <Chart options={options} series={series} type="area" height={280} width="100%" />
      </div>
    </div>
  );
};
