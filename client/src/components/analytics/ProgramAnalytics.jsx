import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Radar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProgramAnalytics = ({ programId }) => {
  const [timeframe, setTimeframe] = useState('6months');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/programs/${programId}/analytics?timeframe=${timeframe}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch analytics data');
        const data = await response.json();
        setAnalyticsData(data.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [programId, timeframe]);

  const effectivenessChartData = {
    labels: analyticsData?.effectivenessTrend.map(point => point.date) || [],
    datasets: [{
      label: 'Program Effectiveness Score',
      data: analyticsData?.effectivenessTrend.map(point => point.score) || [],
      fill: true,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.4
    }]
  };

  const performanceDistributionData = {
    labels: ['Excellent', 'Good', 'Average', 'Needs Improvement'],
    datasets: [{
      label: 'Student Distribution',
      data: analyticsData ? [
        analyticsData.distribution.excellent,
        analyticsData.distribution.good,
        analyticsData.distribution.average,
        analyticsData.distribution.needsImprovement
      ] : [],
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(255, 99, 132, 0.6)'
      ]
    }]
  };

  const metricsRadarData = {
    labels: ['Student Performance', 'Attendance', 'Satisfaction', 'Completion Rate', 'Resource Utilization'],
    datasets: [{
      label: 'Current Metrics',
      data: analyticsData ? [
        analyticsData.metrics.studentPerformance,
        analyticsData.metrics.attendance,
        analyticsData.metrics.satisfaction,
        analyticsData.metrics.completionRate,
        analyticsData.metrics.resourceUtilization
      ] : [],
      fill: true,
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgb(54, 162, 235)',
      pointBackgroundColor: 'rgb(54, 162, 235)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(54, 162, 235)'
    }]
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Program Analytics</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <MenuItem value="1month">Last Month</MenuItem>
            <MenuItem value="3months">Last 3 Months</MenuItem>
            <MenuItem value="6months">Last 6 Months</MenuItem>
            <MenuItem value="1year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Effectiveness Trend</Typography>
              <Box height={300}>
                <Line
                  data={effectivenessChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100
                      }
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (context) => `Score: ${context.parsed.y.toFixed(1)}%`
                        }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Performance Distribution</Typography>
              <Box height={300}>
                <Bar
                  data={performanceDistributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Program Metrics</Typography>
              <Box height={300}>
                <Radar
                  data={metricsRadarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          stepSize: 20
                        }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {analyticsData?.recommendations && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>AI-Powered Recommendations</Typography>
                <Grid container spacing={2}>
                  {analyticsData.recommendations.map((rec, index) => (
                    <Grid item xs={12} key={index}>
                      <Alert 
                        severity={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'info'}
                        sx={{ mb: 1 }}
                      >
                        <Typography variant="subtitle1">{rec.description}</Typography>
                        {rec.specificActions && (
                          <Box mt={1}>
                            <Typography variant="body2">Recommended Actions:</Typography>
                            <ul style={{ marginTop: 4, marginBottom: 0 }}>
                              {rec.specificActions.map((action, idx) => (
                                <li key={idx}>{action}</li>
                              ))}
                            </ul>
                          </Box>
                        )}
                      </Alert>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ProgramAnalytics;
