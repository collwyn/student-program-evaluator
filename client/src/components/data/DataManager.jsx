import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

const DataManager = () => {
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importType, setImportType] = useState('students');
  const [exportType, setExportType] = useState('students');
  const [exportFormat, setExportFormat] = useState('csv');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type !== 'text/csv') {
      setError('Please select a CSV file');
      return;
    }
    setSelectedFile(file);
    setError(null);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file to import');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`/api/v1/import/${importType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Import failed');
      }

      const result = await response.json();
      
      setSuccess(`Successfully imported ${result.data.imported} records`);
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';
      
      if (result.data.errors && result.data.errors.length > 0) {
        setError(`Import completed with ${result.data.errors.length} errors. Please check the error log.`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleExport = async () => {
    try {
      setDownloading(true);
      setError(null);

      const response = await fetch(`/api/v1/export/${exportType}?format=${exportFormat}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportType}_export.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccess('Export completed successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>Data Import/Export</Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Import Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Import Data
              </Typography>

              <Box mb={3}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Import Type</InputLabel>
                  <Select
                    value={importType}
                    onChange={(e) => setImportType(e.target.value)}
                    label="Import Type"
                  >
                    <MenuItem value="students">Students</MenuItem>
                    <MenuItem value="programs">Programs</MenuItem>
                    <MenuItem value="assessments">Assessments</MenuItem>
                  </Select>
                </FormControl>

                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="file-input"
                />
                <Button
                  variant="outlined"
                  component="label"
                  htmlFor="file-input"
                  startIcon={<UploadIcon />}
                  fullWidth
                >
                  Select CSV File
                </Button>

                {selectedFile && (
                  <Box mt={1}>
                    <Chip
                      label={selectedFile.name}
                      onDelete={() => setSelectedFile(null)}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                )}
              </Box>

              <Button
                variant="contained"
                color="primary"
                onClick={handleImport}
                disabled={!selectedFile || uploading}
                startIcon={uploading ? <CircularProgress size={20} /> : <AssignmentIcon />}
                fullWidth
              >
                {uploading ? 'Importing...' : 'Import Data'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Export Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Export Data
              </Typography>

              <Box mb={3}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Export Type</InputLabel>
                  <Select
                    value={exportType}
                    onChange={(e) => setExportType(e.target.value)}
                    label="Export Type"
                  >
                    <MenuItem value="students">Students</MenuItem>
                    <MenuItem value="programs">Programs</MenuItem>
                    <MenuItem value="assessments">Assessments</MenuItem>
                    <MenuItem value="program-report">Program Report</MenuItem>
                    <MenuItem value="performance-analytics">Performance Analytics</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Export Format</InputLabel>
                  <Select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    label="Export Format"
                  >
                    <MenuItem value="csv">CSV</MenuItem>
                    <MenuItem value="xlsx">Excel</MenuItem>
                    <MenuItem value="pdf">PDF</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Button
                variant="contained"
                color="primary"
                onClick={handleExport}
                disabled={downloading}
                startIcon={downloading ? <CircularProgress size={20} /> : <DownloadIcon />}
                fullWidth
              >
                {downloading ? 'Exporting...' : 'Export Data'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DataManager;
