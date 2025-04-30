const SubscriptionService = require('../services/SubscriptionService');
const Organization = require('../models/Organization');
const config = require('../config/config');

class SubscriptionController {
  static async getPlans(req, res) {
    try {
      const plans = config.subscription.plans;
      res.json({
        success: true,
        data: plans
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getCurrentSubscription(req, res) {
    try {
      const organization = await Organization.findById(req.user.organizationId)
        .select('subscription settings.limits');

      if (!organization) {
        return res.status(404).json({
          success: false,
          error: 'Organization not found'
        });
      }

      // Get current usage statistics
      const usage = await this.getOrganizationUsage(organization._id);

      res.json({
        success: true,
        data: {
          subscription: organization.subscription,
          limits: organization.settings.limits,
          usage
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async createSubscription(req, res) {
    try {
      const { planId, paymentMethod } = req.body;

      // Validate plan
      if (!config.subscription.plans[planId]) {
        return res.status(400).json({
          success: false,
          error: 'Invalid plan selected'
        });
      }

      // Check if organization already has a subscription
      const organization = await Organization.findById(req.user.organizationId);
      if (organization.subscription?.status === 'active') {
        return res.status(400).json({
          success: false,
          error: 'Organization already has an active subscription'
        });
      }

      const result = await SubscriptionService.createSubscription(
        req.user.organizationId,
        planId,
        paymentMethod
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async updateSubscription(req, res) {
    try {
      const { planId } = req.body;

      // Validate plan
      if (!config.subscription.plans[planId]) {
        return res.status(400).json({
          success: false,
          error: 'Invalid plan selected'
        });
      }

      // Check if new plan meets current usage requirements
      const usage = await this.getOrganizationUsage(req.user.organizationId);
      const newPlanLimits = config.subscription.plans[planId].limits;

      if (this.exceedsLimits(usage, newPlanLimits)) {
        return res.status(400).json({
          success: false,
          error: 'Current usage exceeds new plan limits'
        });
      }

      await SubscriptionService.updateSubscription(
        req.user.organizationId,
        planId
      );

      res.json({
        success: true,
        message: 'Subscription updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async cancelSubscription(req, res) {
    try {
      await SubscriptionService.cancelSubscription(req.user.organizationId);

      res.json({
        success: true,
        message: 'Subscription will be canceled at the end of the billing period'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async handleWebhook(req, res) {
    try {
      const sig = req.headers['stripe-signature'];
      const event = SubscriptionService.stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      await SubscriptionService.handleWebhook(event);

      res.json({ received: true });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getOrganizationUsage(organizationId) {
    try {
      // Get current usage statistics
      const [studentCount, programCount, storageUsed] = await Promise.all([
        Student.countDocuments({ organizationId }),
        Program.countDocuments({ organizationId }),
        this.calculateStorageUsage(organizationId)
      ]);

      return {
        students: studentCount,
        programs: programCount,
        storage: storageUsed // in MB
      };
    } catch (error) {
      console.error('Error calculating organization usage:', error);
      throw error;
    }
  }

  static async calculateStorageUsage(organizationId) {
    // Implementation would calculate actual storage usage
    // This is a placeholder returning a dummy value
    return 100; // MB
  }

  static exceedsLimits(usage, limits) {
    return (
      usage.students > limits.students ||
      usage.programs > limits.programs ||
      usage.storage > limits.storage
    );
  }

  static async getBillingPortalUrl(req, res) {
    try {
      const organization = await Organization.findById(req.user.organizationId);
      if (!organization?.subscription?.stripeCustomerId) {
        return res.status(404).json({
          success: false,
          error: 'No subscription found'
        });
      }

      const session = await SubscriptionService.stripe.billingPortal.sessions.create({
        customer: organization.subscription.stripeCustomerId,
        return_url: `${process.env.CLIENT_URL}/settings/billing`
      });

      res.json({
        success: true,
        data: {
          url: session.url
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getInvoices(req, res) {
    try {
      const organization = await Organization.findById(req.user.organizationId);
      if (!organization?.subscription?.stripeCustomerId) {
        return res.status(404).json({
          success: false,
          error: 'No subscription found'
        });
      }

      const invoices = await SubscriptionService.stripe.invoices.list({
        customer: organization.subscription.stripeCustomerId,
        limit: 12
      });

      res.json({
        success: true,
        data: invoices.data.map(invoice => ({
          id: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: invoice.status,
          date: invoice.created,
          pdf: invoice.invoice_pdf
        }))
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = SubscriptionController;
