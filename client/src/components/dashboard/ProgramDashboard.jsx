import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import {
  Assessment,
  People,
  Timeline,
  Settings,
  CloudDownload
} from '@mui/icons-material';

import ProgramAnalytics from '../analytics/ProgramAnalytics';
import StudentList from '../tables/StudentList';
import AssessmentManager from '../assessment/AssessmentManager';
import ProgramSettings from '../settings/ProgramSettings';

const ProgramDashboard = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [programData, setProgramData] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchProgramData = async () => {
      try {
        setLoading(true);
        
        // Fetch program details
        const programResponse = await fetch(`/api/v1/programs/${programId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!programResponse.ok) throw new Error('Failed to fetch program data');
        const programJson = await programResponse.json();
        
        // Fetch program metrics
        const metricsResponse = await fetch(`/api/v1/programs/${programId}/effectiveness`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!metricsResponse.ok) throw new Error('Failed to fetch metrics');
        const metricsJson = await metricsResponse.json();

        setProgramData(programJson.data);
        setMetrics(metricsJson.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProgramData();
  }, [programId]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleExportReport = async () => {
    try {
      const response = await fetch(`/api/v1/programs/${programId}/export`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to export report');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `program-report-${programId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export report: ' + err.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box mb={4}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h4" gutterBottom>
              {programData?.name}
            </Typography>
            <Box display="flex" gap={1} alignItems="center">
              <Chip 
                label={programData?.type}
                color="primary"
                size="small"
              />
              <Chip 
                label={programData?.status}
                color={programData?.status === 'active' ? 'success' : 'default'}
                size="small"
              />
            </Box>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<CloudDownload />}
              onClick={handleExportReport}
              sx={{ mr: 2 }}
            >
              Export Report
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Effectiveness Score
              </Typography>
              <Typography variant="h4">
                {metrics?.effectivenessScore?.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Student Satisfaction
              </Typography>
              <Typography variant="h4">
                {metrics?.studentSatisfaction?.toFixed(1)}/5
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Performance
              </Typography>
              <Typography variant="h4">
                {metrics?.averagePerformance?.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completion Rate
              </Typography>
              <Typography variant="h4">
                {metrics?.completionRate?.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="program dashboard tabs">
          <Tab icon={<Timeline />} label="Analytics" />
          <Tab icon={<People />} label="Students" />
          <Tab icon={<Assessment />} label="Assessments" />
          <Tab icon={<Settings />} label="Settings" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <ProgramAnalytics programId={programId} />
      )}

      {activeTab === 1 && (
        <StudentList 
          programId={programId}
          onStudentClick={(studentId) => navigate(`/students/${studentId}`)}
        />
      )}

      {activeTab === 2 && (
        <AssessmentManager programId={programId} />
      )}

      {activeTab === 3 && (
        <ProgramSettings 
          programId={programId}
          programData={programData}
          onUpdate={(updatedData) => setProgramData(updatedData)}
        />
      )}
    </Container>
  );
};

export default ProgramDashboard;
