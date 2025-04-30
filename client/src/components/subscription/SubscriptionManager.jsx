import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const PaymentForm = ({ onSubmit, loading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setError(null);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement)
    });

    if (error) {
      setError(error.message);
    } else {
      onSubmit(paymentMethod.id);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box mb={2}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4'
                }
              },
              invalid: {
                color: '#9e2146'
              }
            }
          }}
        />
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={!stripe || loading}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : 'Subscribe'}
      </Button>
    </form>
  );
};

const SubscriptionManager = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const [plansResponse, subscriptionResponse] = await Promise.all([
        fetch('/api/v1/subscription/plans', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/v1/subscription/current', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (!plansResponse.ok || !subscriptionResponse.ok) {
        throw new Error('Failed to fetch subscription data');
      }

      const plansData = await plansResponse.json();
      const subscriptionData = await subscriptionResponse.json();

      setPlans(plansData.data);
      setCurrentSubscription(subscriptionData.data.subscription);
      setUsage(subscriptionData.data.usage);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    if (currentSubscription?.status === 'active') {
      handlePlanChange(plan.id);
    } else {
      setShowPaymentDialog(true);
    }
  };

  const handlePlanChange = async (planId) => {
    try {
      setProcessingPayment(true);
      const response = await fetch('/api/v1/subscription/update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planId })
      });

      if (!response.ok) throw new Error('Failed to update subscription');

      await fetchSubscriptionData();
      setShowPaymentDialog(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePaymentSubmit = async (paymentMethodId) => {
    try {
      setProcessingPayment(true);
      const response = await fetch('/api/v1/subscription/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          paymentMethod: paymentMethodId
        })
      });

      if (!response.ok) throw new Error('Failed to create subscription');

      const { data } = await response.json();
      
      // Handle subscription confirmation if needed
      if (data.clientSecret) {
        const stripe = await stripePromise;
        const { error } = await stripe.confirmCardPayment(data.clientSecret);
        if (error) throw error;
      }

      await fetchSubscriptionData();
      setShowPaymentDialog(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch('/api/v1/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to cancel subscription');

      await fetchSubscriptionData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {currentSubscription && (
        <Box mb={4}>
          <Typography variant="h5" gutterBottom>Current Subscription</Typography>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="textSecondary">Plan</Typography>
                  <Typography variant="h6">{plans[currentSubscription.plan]?.name}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="textSecondary">Status</Typography>
                  <Typography variant="h6" color={
                    currentSubscription.status === 'active' ? 'success.main' : 'error.main'
                  }>
                    {currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1)}
                  </Typography>
                </Grid>
                {usage && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>Current Usage</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography color="textSecondary">Students</Typography>
                        <Typography>{usage.students} / {plans[currentSubscription.plan]?.limits.students}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography color="textSecondary">Programs</Typography>
                        <Typography>{usage.programs} / {plans[currentSubscription.plan]?.limits.programs}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography color="textSecondary">Storage</Typography>
                        <Typography>{usage.storage}MB / {plans[currentSubscription.plan]?.limits.storage}MB</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      <Typography variant="h5" gutterBottom>Available Plans</Typography>
      <Grid container spacing={3}>
        {Object.entries(plans).map(([planId, plan]) => (
          <Grid item xs={12} md={4} key={planId}>
            <Card 
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: currentSubscription?.plan === planId ? 
                  `2px solid ${theme.palette.primary.main}` : 
                  'none'
              }}
            >
              <CardHeader
                title={plan.name}
                subheader={`$${plan.price}/month`}
                titleTypographyProps={{ align: 'center' }}
                subheaderTypographyProps={{ align: 'center' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <List>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => handlePlanSelect({ id: planId, ...plan })}
                  disabled={currentSubscription?.plan === planId}
                >
                  {currentSubscription?.plan === planId ? 'Current Plan' : 'Select Plan'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={showPaymentDialog} onClose={() => setShowPaymentDialog(false)}>
        <DialogTitle>Subscribe to {selectedPlan?.name}</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            You will be charged ${selectedPlan?.price} monthly
          </Typography>
          <Elements stripe={stripePromise}>
            <PaymentForm
              onSubmit={handlePaymentSubmit}
              loading={processingPayment}
            />
          </Elements>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default SubscriptionManager;
