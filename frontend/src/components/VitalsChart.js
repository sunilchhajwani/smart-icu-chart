import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const VitalsChart = ({ vitals, autoScale, yMax }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Heart Rate',
        data: [],
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
      {
        label: 'SpO2',
        data: [],
        fill: false,
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1,
      },
      {
        label: 'Respiratory Rate',
        data: [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Urine Output',
        data: [],
        fill: false,
        borderColor: 'rgb(255, 159, 64)',
        tension: 0.1,
      },
      {
        label: 'GCS',
        data: [],
        fill: false,
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1,
      },
      {
        label: 'Vent FiO2',
        data: [],
        fill: false,
        borderColor: 'rgb(255, 206, 86)',
        tension: 0.1,
      },
      {
        label: 'Vent PEEP',
        data: [],
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
      {
        label: 'Vent Tidal Volume',
        data: [],
        fill: false,
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1,
      },
      {
        label: 'Vent RR',
        data: [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Vent Peak Pressure',
        data: [],
        fill: false,
        borderColor: 'rgb(100, 149, 237)',
        tension: 0.1,
      },
      {
        label: 'Vent Plateau Pressure',
        data: [],
        fill: false,
        borderColor: 'rgb(218, 112, 214)',
        tension: 0.1,
      },
      {
        label: 'Vent Mean Pressure',
        data: [],
        fill: false,
        borderColor: 'rgb(255, 165, 0)',
        tension: 0.1,
      },
    ],
  });

  useEffect(() => {
    // Check if we have any vital data
    if (vitals.heartRate || vitals.spo2 || vitals.respiratoryRate || vitals.urineOutput || vitals.gcs || vitals.ventilatorParameters?.fio2 || vitals.ventilatorParameters?.peep || vitals.ventilatorParameters?.tidalVolume || vitals.ventilatorParameters?.rr || vitals.ventilatorParameters?.peakPressure || vitals.ventilatorParameters?.plateauPressure || vitals.ventilatorParameters?.meanPressure) {
        setChartData(prevChartData => {
            const newLabels = [...prevChartData.labels, new Date().toLocaleTimeString()];
            
            // Get current data arrays
            const heartRateData = [...prevChartData.datasets[0].data];
            const spo2Data = [...prevChartData.datasets[1].data];
            const respiratoryRateData = [...prevChartData.datasets[2].data];
            const urineOutputData = [...prevChartData.datasets[3].data];
            const gcsData = [...prevChartData.datasets[4].data];
            const ventFiO2Data = [...prevChartData.datasets[5].data];
            const ventPEEPData = [...prevChartData.datasets[6].data];
            const ventTidalVolumeData = [...prevChartData.datasets[7].data];
            const ventRRData = [...prevChartData.datasets[8].data];
            const ventPeakPressureData = [...prevChartData.datasets[9].data];
            const ventPlateauPressureData = [...prevChartData.datasets[10].data];
            const ventMeanPressureData = [...prevChartData.datasets[11].data];
            
            // Add new data points
            heartRateData.push(vitals.heartRate || null);
            spo2Data.push(vitals.spo2 || null);
            respiratoryRateData.push(vitals.respiratoryRate || null);
            urineOutputData.push(vitals.urineOutput || null);
            gcsData.push(vitals.gcs || null);
            ventFiO2Data.push(vitals.ventilatorParameters?.fio2 || null);
            ventPEEPData.push(vitals.ventilatorParameters?.peep || null);
            ventTidalVolumeData.push(vitals.ventilatorParameters?.tidalVolume || null);
            ventRRData.push(vitals.ventilatorParameters?.rr || null);
            ventPeakPressureData.push(vitals.ventilatorParameters?.peakPressure || null);
            ventPlateauPressureData.push(vitals.ventilatorParameters?.plateauPressure || null);
            ventMeanPressureData.push(vitals.ventilatorParameters?.meanPressure || null);
    
            // Limit to 15 data points
            if (newLabels.length > 15) {
              newLabels.shift();
              heartRateData.shift();
              spo2Data.shift();
              respiratoryRateData.shift();
              urineOutputData.shift();
              gcsData.shift();
              ventFiO2Data.shift();
              ventPEEPData.shift();
              ventTidalVolumeData.shift();
              ventRRData.shift();
              ventPeakPressureData.shift();
              ventPlateauPressureData.shift();
              ventMeanPressureData.shift();
            }
    
            return {
              ...prevChartData,
              labels: newLabels,
              datasets: [
                {
                  ...prevChartData.datasets[0],
                  data: heartRateData,
                },
                {
                  ...prevChartData.datasets[1],
                  data: spo2Data,
                },
                {
                  ...prevChartData.datasets[2],
                  data: respiratoryRateData,
                },
                {
                  ...prevChartData.datasets[3],
                  data: urineOutputData,
                },
                {
                  ...prevChartData.datasets[4],
                  data: gcsData,
                },
                {
                  ...prevChartData.datasets[5],
                  data: ventFiO2Data,
                },
                {
                  ...prevChartData.datasets[6],
                  data: ventPEEPData,
                },
                {
                  ...prevChartData.datasets[7],
                  data: ventTidalVolumeData,
                },
                {
                  ...prevChartData.datasets[8],
                  data: ventRRData,
                },
                {
                  ...prevChartData.datasets[9],
                  data: ventPeakPressureData,
                },
                {
                  ...prevChartData.datasets[10],
                  data: ventPlateauPressureData,
                },
                {
                  ...prevChartData.datasets[11],
                  data: ventMeanPressureData,
                },
              ],
            };
        });
    }
  }, [vitals]);

  const getChartMax = () => {
    if (autoScale) return undefined;
    return yMax;
  };

  const options = {
    scales: {
      y: {
        min: 0,
        max: getChartMax(),
        ticks: {
          stepSize: 5,
        }
      },
    },
    animation: {
        duration: 200,
    },
    maintainAspectRatio: false,
  };

  return <div style={{ height: '400px' }}><Line data={chartData} options={options} /></div>;
};

export default VitalsChart;