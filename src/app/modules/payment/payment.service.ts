import https from "https";
import querystring from "querystring";
import { PaymentTransaction } from "./payment.model";
import {
  IPaymentTransaction,
  IInitiatePaymentRequest,
  ISSLCommerz,
  ISSLCommerzResponse,
  IPaymentValidationRequest,
} from "./payment.interface";
import {
  sslCommerzConfig,
  SSL_COMMERZ_ENDPOINTS,
  //   PAYMENT_STATUS,
} from "../../config/ssl-commerz.config";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { Types } from "mongoose";

/**
 * Make HTTPS POST request to SSL Commerz API
 * Helper method for API communication
 */
async function makeHttpsRequest(
  baseUrl: string,
  path: string,
  data: Record<string, string | number | boolean>
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify(data);

    const url = new URL(baseUrl + path);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          // Try to parse as JSON
          const jsonData = JSON.parse(responseData) as Record<string, unknown>;
          resolve(jsonData);
        } catch {
          // If not JSON, return as object
          resolve({} as Record<string, unknown>);
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Generate a unique transaction ID
 * Format: TXN_TIMESTAMP_RANDOMSTRING
 */
function generateTransactionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN_${timestamp}_${random}`;
}

/**
 * Initiate a payment transaction
 * Creates a transaction record and generates SSL Commerz payment link
 */
async function initiatePayment(payload: IInitiatePaymentRequest) {
  try {
    // Generate unique transaction ID
    const transactionId = generateTransactionId();

    // Create payment transaction record in database
    const paymentRecord = await PaymentTransaction.create({
      userId: new Types.ObjectId(payload.userId),
      rideId: payload.rideId ? new Types.ObjectId(payload.rideId) : undefined,
      transactionId,
      amount: payload.amount,
      currency: payload.currency || "BDT",
      status: "INITIATED",
      customerEmail: payload.customerEmail,
      customerPhone: payload.customerPhone,
      customerName: payload.customerName,
      description: payload.description || "Ride Booking Payment",
    });

    // Prepare SSL Commerz payment request
    const sslPaymentData: ISSLCommerz = {
      store_id: sslCommerzConfig.storeId,
      store_passwd: sslCommerzConfig.storePassword,
      total_amount: payload.amount,
      currency: payload.currency || "BDT",
      tran_id: transactionId,
      success_url: `${sslCommerzConfig.appBaseUrl}/api/v1/payment/success`,
      fail_url: `${sslCommerzConfig.appBaseUrl}/api/v1/payment/fail`,
      cancel_url: `${sslCommerzConfig.appBaseUrl}/api/v1/payment/cancel`,
      ipn_url: `${sslCommerzConfig.appBaseUrl}/api/v1/payment/ipn`,
      cus_name: payload.customerName,
      cus_email: payload.customerEmail,
      cus_phone: payload.customerPhone,
      product_name: payload.description || "Ride Booking",
      product_category: "Travel",
      product_profile: "service",
      // Custom values to store our transaction ID for reference
      value_a: transactionId,
      value_b: payload.userId.toString(),
    };

    // Call SSL Commerz API to initialize payment
    const response = await makeHttpsRequest(
      sslCommerzConfig.apiBaseUrl,
      SSL_COMMERZ_ENDPOINTS.INIT_PAYMENT,
      sslPaymentData as unknown as Record<string, string | number | boolean>
    );

    // Check if API request was successful
    if (response.status !== "success") {
      // Update transaction status to FAILED
      await PaymentTransaction.findByIdAndUpdate(paymentRecord._id, {
        status: "FAILED",
        errorMessage: response.failedreason || "Failed to initialize payment",
      });

      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Failed to initialize payment. Please try again."
      );
    }

    // Update transaction with SSL Commerz response
    await PaymentTransaction.findByIdAndUpdate(paymentRecord._id, {
      status: "PENDING",
      sslResponse: response,
    });

    // Return payment URL and transaction ID to client
    return {
      paymentUrl: response.GatewayPageURL,
      transactionId,
      redirectUrl: response.redirectGatewayURL,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "SSL Commerz service error. Please try again later."
    );
  }
}

/**
 * Handle SSL Commerz success callback
 * Called when user completes payment successfully
 */
async function handleSuccessCallback(data: Record<string, unknown>) {
  const transactionId = data.tran_id as string;

  // Find the payment transaction
  const payment = await PaymentTransaction.findOne({ transactionId });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment transaction not found");
  }

  // Update transaction with success status
  const updatedPayment = await PaymentTransaction.findByIdAndUpdate(
    payment._id,
    {
      status: "COMPLETED",
      sslTransactionId: transactionId,
      sslResponse: data,
      paymentMethod: (data.card_type as string) || "UNKNOWN",
    },
    { new: true }
  );

  return updatedPayment as IPaymentTransaction;
}

/**
 * Handle SSL Commerz failure callback
 * Called when payment fails
 */
async function handleFailureCallback(data: Record<string, unknown>) {
  const transactionId = data.tran_id as string;

  // Find and update the payment transaction
  const payment = await PaymentTransaction.findOne({ transactionId });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment transaction not found");
  }

  const updatedPayment = await PaymentTransaction.findByIdAndUpdate(
    payment._id,
    {
      status: "FAILED",
      errorMessage:
        (data.error_message as string) || "Payment processing failed",
      sslResponse: data,
    },
    { new: true }
  );

  return updatedPayment as IPaymentTransaction;
}

/**
 * Handle SSL Commerz cancellation callback
 * Called when user cancels payment
 */
async function handleCancellationCallback(data: Record<string, unknown>) {
  const transactionId = data.tran_id as string;

  const payment = await PaymentTransaction.findOne({ transactionId });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment transaction not found");
  }

  const updatedPayment = await PaymentTransaction.findByIdAndUpdate(
    payment._id,
    {
      status: "CANCELLED",
      errorMessage: "Payment cancelled by user",
      sslResponse: data,
    },
    { new: true }
  );

  return updatedPayment as IPaymentTransaction;
}

/**
 * Validate payment with SSL Commerz
 * Verifies payment validity using SSL Commerz validation API
 */
async function validatePayment(
  payload: IPaymentValidationRequest
): Promise<ISSLCommerzResponse> {
  // Prepare validation request
  const validationData: Record<string, string> = {
    val_id: payload.val_id,
    store_id: sslCommerzConfig.storeId,
    store_passwd: sslCommerzConfig.storePassword,
    format: "json",
  };

  try {
    // Call SSL Commerz validation API
    const response = await makeHttpsRequest(
      sslCommerzConfig.apiBaseUrl,
      SSL_COMMERZ_ENDPOINTS.VALIDATE_PAYMENT,
      validationData
    );

    // Check validation response
    if (response.status === "VALID" || response.status === "VALIDATED") {
      // Update payment status to COMPLETED if validation successful
      await PaymentTransaction.findOneAndUpdate(
        { transactionId: response.tran_id },
        {
          status: "COMPLETED",
          sslTransactionId: response.tran_id,
          gatewayResponse: response,
        }
      );

      return response as unknown as ISSLCommerzResponse;
    }

    throw new AppError(httpStatus.BAD_REQUEST, "Payment validation failed");
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "SSL Commerz validation service error"
    );
  }
}

/**
 * Get payment transaction details
 * Retrieves payment information by transaction ID
 */
async function getPaymentDetails(transactionId: string) {
  const payment = await PaymentTransaction.findOne({
    transactionId,
    isDeleted: false,
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment transaction not found");
  }

  return payment;
}

/**
 * Get user's payment history
 * Retrieves all payment transactions for a specific user
 */
async function getUserPaymentHistory(userId: string, limit = 10, skip = 0) {
  const payments = await PaymentTransaction.find({
    userId: new Types.ObjectId(userId),
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await PaymentTransaction.countDocuments({
    userId: new Types.ObjectId(userId),
    isDeleted: false,
  });

  return {
    data: payments,
    total,
  };
}

/**
 * Get payment statistics for a user
 * Calculates total paid amount and transaction count
 */
async function getUserPaymentStats(userId: string) {
  const stats = await PaymentTransaction.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const result = {
    totalAmount: 0,
    completedTransactions: 0,
    failedTransactions: 0,
    totalTransactions: 0,
  };

  stats.forEach((stat) => {
    result.totalTransactions += stat.count;
    if (stat._id === "COMPLETED") {
      result.completedTransactions = stat.count;
      result.totalAmount = stat.totalAmount;
    } else if (stat._id === "FAILED") {
      result.failedTransactions = stat.count;
    }
  });

  return result;
}

/**
 * Refund a payment
 * Initiates a refund for a completed payment transaction
 * Note: This is a placeholder - actual refund logic depends on SSL Commerz refund API
 */
async function refundPayment(transactionId: string, reason: string) {
  const payment = await PaymentTransaction.findOne({ transactionId });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment transaction not found");
  }

  if (payment.status !== "COMPLETED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only completed payments can be refunded"
    );
  }

  // Update payment status to REFUNDED
  const refundedPayment = await PaymentTransaction.findByIdAndUpdate(
    payment._id,
    {
      status: "REFUNDED",
      errorMessage: reason,
    },
    { new: true }
  );

  return refundedPayment as IPaymentTransaction;
}

export const PaymentService = {
  initiatePayment,
  handleSuccessCallback,
  handleFailureCallback,
  handleCancellationCallback,
  validatePayment,
  getPaymentDetails,
  getUserPaymentHistory,
  getUserPaymentStats,
  refundPayment,
};
