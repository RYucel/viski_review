import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { AromaticProfile } from '../../types/whisky';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface AromaticProfileChartProps {
  profile: AromaticProfile;
  className?: string;
  showLegend?: boolean;
}

const AromaticProfileChart: React.FC<AromaticProfileChartProps> = ({ 
  profile, 
  className,
  showLegend = false
}) => {
  const data = {
    labels: ['Dolgunluk', 'Zenginlik', 'Tatlılık', 'İslilik', 'Bitiş'],
    datasets: [
      {
        label: 'Aroma Profili',
        data: [
          profile.body, 
          profile.richness, 
          profile.sweetness, 
          profile.smokiness, 
          profile.finish
        ],
        backgroundColor: 'rgba(185, 130, 70, 0.2)',
        borderColor: 'rgba(185, 130, 70, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(185, 130, 70, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(185, 130, 70, 1)',
      }
    ]
  };

  const options = {
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        suggestedMin: 0,
        suggestedMax: 5,
        ticks: {
          stepSize: 1,
          backdropColor: 'transparent',
        },
      }
    },
    plugins: {
      legend: {
        display: showLegend,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.raw}/5`;
          }
        }
      }
    },
    maintainAspectRatio: true,
  };

  return (
    <div className={className}>
      <Radar data={data} options={options} />
    </div>
  );
};

export default AromaticProfileChart;