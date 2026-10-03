import { Router } from 'express';
import { paymentController } from './payment.controller';
import { requireAuth, requireFrontDesk } from '../../middleware';

const router = Router();

router.get('/user/me/payment-methods', requireAuth, paymentController.listPaymentMethods);
router.post(
  '/user/me/payment-methods/setup-intent',
  requireAuth,
  paymentController.createSetupIntent,
);
router.post('/user/me/payment-methods', requireAuth, paymentController.savePaymentMethod);
router.put(
  '/user/me/payment-methods/:id/default',
  requireAuth,
  paymentController.setDefaultPaymentMethod,
);
router.delete('/user/me/payment-methods/:id', requireAuth, paymentController.deletePaymentMethod);

router.post(
  '/bookings/:bookingId/payments/intent',
  requireAuth,
  paymentController.createPaymentIntent,
);

router.post(
  '/bookings/:bookingId/payments/charge-saved',
  requireAuth,
  paymentController.chargeSavedCard,
);

router.post('/bookings/:bookingId/payments/confirm', requireAuth, paymentController.confirmPayment);

router.post(
  '/bookings/:bookingId/payments/cash',
  requireAuth,
  requireFrontDesk,
  paymentController.recordCashPayment,
);

router.post(
  '/bookings/:bookingId/refund',
  requireAuth,
  requireFrontDesk,
  paymentController.processRefund,
);

router.get('/bookings/:bookingId/folio', requireAuth, paymentController.getFolio);

router.post(
  '/bookings/:bookingId/folio/charge',
  requireAuth,
  requireFrontDesk,
  paymentController.addCharge,
);

router.get(
  '/bookings/:bookingId/payments',
  requireAuth,
  requireFrontDesk,
  paymentController.getPaymentHistory,
);

export default router;
