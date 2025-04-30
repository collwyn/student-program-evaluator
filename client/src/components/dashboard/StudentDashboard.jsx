import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import { Line, Bar, Radar } from 'react-chartjs-2';
import { format } from 'date-fns';

import PerformanceCard from '../shared/PerformanceCard';
import AttendanceChart from '../charts/AttendanceChart';
import GradesTrend from '../charts/GradesTrend';
import ProgramProgress from '../charts/ProgramProgress';
import RecommendationsList from '../shared/RecommendationsList';
import AssessmentHistory from '../tables/AssessmentHistory';
import HolisticProfile from '../profile/HolisticProfile';

const StudentDashboard = () => {
  const { studentId } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        // Fetch student profile data
        const studentResponse = await fetch(`/api/v1/students/${studentId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!studentResponse.ok) throw new Error('Failed to fetch student data');
        const studentJson = await studentResponse.json();
        
        // Fetch performance data
        const performanceResponse = await fetch(`/api/v1/students/${studentId}/performance`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!performanceResponse.ok) throw new Error('Failed to fetch performance data');
        const performanceJson = await performanceResponse.json();
        
        // Fetch AI recommendations
        const recommendationsResponse = await fetch(`/api/v1/students/${studentId}/recommendations`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!recommendationsResponse.ok) throw new Error('Failed to fetch recommendations');
        const recommendationsJson = await recommendationsResponse.json();

        setStudentData(studentJson.data);
        setPerformanceData(performanceJson.data);
        setRecommendations(recommendationsJson.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
        <Typography variant="h4" gutterBottom>
          {studentData?.personalInfo.firstName} {studentData?.personalInfo.lastName}'s Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Student ID: {studentData?.personalInfo.studentId}
        </Typography>
      </Box>

      <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard tabs" sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Performance" />
        <Tab label="Attendance" />
        <Tab label="Programs" />
        <Tab label="Recommendations" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <PerformanceCard
              title="Overall Performance"
              score={performanceData?.academicProfile.performanceMetrics.overallGPA || 0}
              maxScore={4.0}
              trend={performanceData?.trend}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <PerformanceCard
              title="Attendance Rate"
              score={performanceData?.academicProfile.performanceMetrics.attendanceRate || 0}
              maxScore={100}
              type="percentage"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <PerformanceCard
              title="Program Progress"
              score={performanceData?.progressTracking.overallProgress || 0}
              maxScore={100}
              type="percentage"
            />
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Performance Trend</Typography>
                <GradesTrend data={performanceData?.assessments || []} />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Recommendations</Typography>
                <RecommendationsList 
                  recommendations={recommendations.slice(0, 3)}
                  compact
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <AssessmentHistory 
              assessments={performanceData?.assessments || []}
              programs={studentData?.programIds || []}
            />
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <AttendanceChart 
              attendance={performanceData?.attendance || []}
              programs={studentData?.programIds || []}
            />
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ProgramProgress 
              programs={studentData?.programIds || []}
              progress={performanceData?.progressTracking || {}}
            />
          </Grid>
        </Grid>
      )}

      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <RecommendationsList 
              recommendations={recommendations}
              detailed
            />
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default StudentDashboard;
