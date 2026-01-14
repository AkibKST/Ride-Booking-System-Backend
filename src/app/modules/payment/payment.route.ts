import { Router } from "express";
import { PaymentController } from "./payment.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import {
  InitiatePaymentSchema,
  PaymentValidationSchema,
  IPNWebhookSchema,
} from "./payment.validation";
import { Role } from "../user/user.interface";

/**
 * @router PaymentRoutes
 * @description Routes for payment operations
 * All routes follow RESTful conventions
 *
 * Base path: /api/v1/payment
 */
export const PaymentRoutes = Router();

/**
 * POST /api/v1/payment/initiate
 * @description Initiate a new payment transaction
 * @access Private - Requires JWT authentication
 * @body {IInitiatePaymentRequest} Payment details
 * @returns {Object} Payment gateway URL and transaction ID
 *
 * This endpoint creates a payment transaction record and returns
 * the SSL Commerz payment gateway URL for user to complete payment
 */
PaymentRoutes.post(
  "/initiate",
  checkAuth(Role.RIDER), // Ensure user is authenticated
  validateRequest(InitiatePaymentSchema), // Validate request body
  PaymentController.initiatePayment
);

/**
 * GET /api/v1/payment/success
 * @description SSL Commerz success callback endpoint
 * @access Public - Called by SSL Commerz payment gateway
 * @query {string} tran_id - Transaction ID from SSL Commerz
 * @query {string} val_id - Validation ID
 * @returns {Object} Success response with transaction details
 *
 * User is redirected here after successful payment
 * Updates payment status to COMPLETED
 */
PaymentRoutes.get("/success", PaymentController.handleSuccessCallback);

/**
 * GET /api/v1/payment/fail
 * @description SSL Commerz failure callback endpoint
 * @access Public - Called by SSL Commerz payment gateway
 * @query {string} tran_id - Transaction ID from SSL Commerz
 * @query {string} error_message - Error message from gateway
 * @returns {Object} Failure response with error details
 *
 * User is redirected here if payment fails
 * Updates payment status to FAILED
 */
PaymentRoutes.get("/fail", PaymentController.handleFailureCallback);

/**
 * GET /api/v1/payment/cancel
 * @description SSL Commerz cancellation callback endpoint
 * @access Public - Called by SSL Commerz payment gateway
 * @query {string} tran_id - Transaction ID from SSL Commerz
 * @returns {Object} Cancellation response
 *
 * User is redirected here if they cancel payment
 * Updates payment status to CANCELLED
 */
PaymentRoutes.get("/cancel", PaymentController.handleCancellationCallback);

/**
 * POST /api/v1/payment/ipn
 * @description SSL Commerz IPN (Instant Payment Notification) webhook
 * @access Public - Called by SSL Commerz servers
 * @body {Record<string, any>} IPN webhook data
 * @returns {string} "VERIFIED" for SSL Commerz acknowledgment
 *
 * Called asynchronously by SSL Commerz servers after payment processing
 * This is more reliable than browser redirects for confirming payment
 * Response must be exactly "VERIFIED" string
 */
PaymentRoutes.post(
  "/ipn",
  validateRequest(IPNWebhookSchema), // Validate webhook structure
  PaymentController.handleIPNWebhook
);

/**
 * POST /api/v1/payment/validate
 * @description Validate payment with SSL Commerz
 * @access Private - Requires JWT authentication
 * @body {IPaymentValidationRequest} Validation request data
 * @returns {Object} Validation result from SSL Commerz
 *
 * Explicitly validates a payment with SSL Commerz
 * Used as additional verification after success callback
 */
PaymentRoutes.post(
  "/validate",
  checkAuth(Role.RIDER, Role.ADMIN, Role.SUPER_ADMIN), // Ensure user is authenticated
  validateRequest(PaymentValidationSchema), // Validate request data
  PaymentController.validatePayment
);

/**
 * GET /api/v1/payment/:transactionId
 * @description Get payment transaction details
 * @access Private - Requires JWT authentication
 * @param {string} transactionId - Transaction ID
 * @returns {Object} Complete payment transaction details
 *
 * Returns full information about a specific payment transaction
 * including SSL Commerz response and payment status
 */
PaymentRoutes.get(
  "/:transactionId",
  checkAuth(Role.RIDER, Role.ADMIN, Role.SUPER_ADMIN, Role.DRIVER), // Ensure user is authenticated
  PaymentController.getPaymentDetails
);

/**
 * GET /api/v1/payment/history/list
 * @description Get user's payment transaction history
 * @access Private - Requires JWT authentication
 * @query {number} limit - Records per page (default: 10)
 * @query {number} skip - Records to skip for pagination (default: 0)
 * @returns {Object} Array of payment transactions and total count
 *
 * Retrieves paginated payment history for authenticated user
 * Sorted by creation date (newest first)
 */
PaymentRoutes.get(
  "/history/list",
  checkAuth(Role.RIDER, Role.ADMIN, Role.SUPER_ADMIN, Role.DRIVER), // Ensure user is authenticated
  PaymentController.getUserPaymentHistory
);

/**
 * GET /api/v1/payment/stats
 * @description Get user's payment statistics
 * @access Private - Requires JWT authentication
 * @returns {Object} Payment statistics summary
 *
 * Returns aggregated payment data including:
 * - Total amount paid
 * - Number of completed transactions
 * - Number of failed transactions
 * - Total number of transactions
 */
PaymentRoutes.get(
  "/stats",
  checkAuth(Role.RIDER, Role.ADMIN, Role.SUPER_ADMIN, Role.DRIVER), // Ensure user is authenticated
  PaymentController.getUserPaymentStats
);

/**
 * POST /api/v1/payment/:transactionId/refund
 * @description Refund a completed payment
 * @access Private - Requires JWT authentication
 * @param {string} transactionId - Transaction ID to refund
 * @body {string} reason - Refund reason
 * @returns {Object} Refunded transaction details
 *
 * Initiates refund for a completed payment transaction
 * Only completed payments can be refunded
 */
PaymentRoutes.post(
  "/:transactionId/refund",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN), // Ensure user is authenticated
  PaymentController.refundPayment
);
