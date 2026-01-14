// /**
//  * @file payment.integration.example.ts
//  * @description Example implementation showing how to integrate SSL Commerz payment
//  * into the Ride Booking System
//  *
//  * This file demonstrates:
//  * - How to initiate payment from the ride booking flow
//  * - How to handle payment responses
//  * - How to track payment status
//  * - How to integrate with ride completion
//  */

// import { Request, Response } from "express";
// import { PaymentService } from "./payment.service";
// import { IInitiatePaymentRequest } from "./payment.interface";
// import { RideService } from "../ride/ride.service"; // Hypothetical import
// import { UserService } from "../user/user.service"; // Hypothetical import

// /**
//  * EXAMPLE 1: Initiate Payment After Ride Completion
//  *
//  * When a ride is completed, initiate payment for the ride fare
//  */
// export async function initiateRidePayment(
//   rideId: string,
//   userId: string,
//   rideFare: number,
//   customerData: {
//     email: string;
//     phone: string;
//     name: string;
//   }
// ) {
//   try {
//     // Step 1: Create payment request payload
//     const paymentPayload: IInitiatePaymentRequest = {
//       userId: userId as any, // In real code, convert to ObjectId
//       rideId: rideId as any, // In real code, convert to ObjectId
//       amount: rideFare,
//       currency: "BDT",
//       customerEmail: customerData.email,
//       customerPhone: customerData.phone,
//       customerName: customerData.name,
//       description: `Payment for Ride ${rideId}`,
//     };

//     // Step 2: Initiate payment with SSL Commerz
//     const paymentResult = await PaymentService.initiatePayment(paymentPayload);

//     // Step 3: Return payment gateway URL to frontend
//     return {
//       success: true,
//       paymentUrl: paymentResult.paymentUrl,
//       transactionId: paymentResult.transactionId,
//       message: "Please complete payment in the gateway",
//     };
//   } catch (error) {
//     console.error("Payment initiation failed:", error);
//     return {
//       success: false,
//       message: "Failed to initiate payment",
//       error: error,
//     };
//   }
// }

// /**
//  * EXAMPLE 2: Handle Success Callback from SSL Commerz
//  *
//  * After user completes payment, SSL Commerz redirects to success URL
//  * Update ride status and mark payment as complete
//  */
// export async function handlePaymentSuccess(
//   transactionId: string,
//   rideId: string
// ) {
//   try {
//     // Step 1: Get payment details from database
//     const payment = await PaymentService.getPaymentDetails(transactionId);

//     if (!payment) {
//       throw new Error("Payment not found");
//     }

//     if (payment.status !== "COMPLETED") {
//       throw new Error("Payment not completed");
//     }

//     // Step 2: Update ride status to COMPLETED
//     // const ride = await RideService.updateRideStatus(
//     //   rideId,
//     //   "COMPLETED"
//     // );

//     // Step 3: Send payment confirmation email to user
//     // await EmailService.sendPaymentConfirmation(
//     //   payment.customerEmail,
//     //   payment.transactionId,
//     //   payment.amount
//     // );

//     return {
//       success: true,
//       message: "Payment completed successfully",
//       transactionId: payment.transactionId,
//       amount: payment.amount,
//       rideId: rideId,
//     };
//   } catch (error) {
//     console.error("Success callback error:", error);
//     throw error;
//   }
// }

// /**
//  * EXAMPLE 3: Handle Failure Callback from SSL Commerz
//  *
//  * If payment fails, mark transaction as failed and notify user
//  */
// export async function handlePaymentFailure(
//   transactionId: string,
//   rideId: string,
//   errorMessage: string
// ) {
//   try {
//     // Step 1: Get payment details
//     const payment = await PaymentService.getPaymentDetails(transactionId);

//     if (!payment) {
//       throw new Error("Payment not found");
//     }

//     // Step 2: Keep ride as pending (user can try payment again)
//     // const ride = await RideService.updateRideStatus(
//     //   rideId,
//     //   "PAYMENT_FAILED"
//     // );

//     // Step 3: Send failure notification email
//     // await EmailService.sendPaymentFailureNotification(
//     //   payment.customerEmail,
//     //   errorMessage
//     // );

//     return {
//       success: false,
//       message: "Payment failed",
//       transactionId: payment.transactionId,
//       errorMessage: payment.errorMessage,
//       rideId: rideId,
//     };
//   } catch (error) {
//     console.error("Failure callback error:", error);
//     throw error;
//   }
// }

// /**
//  * EXAMPLE 4: Validate Payment for IPN Webhook
//  *
//  * SSL Commerz sends IPN (Instant Payment Notification) webhook
//  * This is the most reliable way to confirm payment status
//  */
// export async function handleIPNValidation(
//   ipnData: Record<string, any>,
//   rideId: string
// ) {
//   try {
//     // Step 1: Extract transaction details from IPN
//     const transactionId = ipnData.tran_id;
//     const status = ipnData.status;
//     const amount = ipnData.amount;

//     console.log(
//       `IPN Received - Transaction: ${transactionId}, Status: ${status}`
//     );

//     // Step 2: Determine action based on status
//     if (status === "VALID" || status === "VALIDATED") {
//       // Payment successful
//       console.log("Payment VALID from IPN");
//       // Update ride and payment records
//     } else if (status === "FAILED") {
//       // Payment failed
//       console.log("Payment FAILED from IPN");
//       // Mark ride as payment failed
//     } else if (status === "CANCELLED") {
//       // User cancelled
//       console.log("Payment CANCELLED from IPN");
//       // Keep ride in pending state
//     }

//     // Step 3: Return "VERIFIED" to SSL Commerz (required)
//     return "VERIFIED";
//   } catch (error) {
//     console.error("IPN validation error:", error);
//     return "FAILED";
//   }
// }

// /**
//  * EXAMPLE 5: Get User Payment History
//  *
//  * Show user their payment history and statistics
//  */
// export async function getUserPaymentInfo(userId: string) {
//   try {
//     // Step 1: Get payment history
//     const history = await PaymentService.getUserPaymentHistory(
//       userId,
//       10, // limit
//       0 // skip
//     );

//     // Step 2: Get payment statistics
//     const stats = await PaymentService.getUserPaymentStats(userId);

//     // Step 3: Return combined data
//     return {
//       success: true,
//       history: history.data,
//       totalRecords: history.total,
//       statistics: stats,
//     };
//   } catch (error) {
//     console.error("Error fetching payment info:", error);
//     throw error;
//   }
// }

// /**
//  * EXAMPLE 6: Refund Payment
//  *
//  * Refund a completed payment (e.g., for cancelled rides)
//  */
// export async function refundPaymentForCancelledRide(
//   transactionId: string,
//   rideId: string,
//   reason: string = "Ride cancelled by user"
// ) {
//   try {
//     // Step 1: Validate ride can be cancelled
//     // const ride = await RideService.getRideById(rideId);
//     // if (ride.status === "COMPLETED") {
//     //   throw new Error("Cannot refund completed rides");
//     // }

//     // Step 2: Initiate refund
//     const refundResult = await PaymentService.refundPayment(
//       transactionId,
//       reason
//     );

//     // Step 3: Update ride status
//     // await RideService.updateRideStatus(rideId, "REFUNDED");

//     // Step 4: Send refund confirmation email
//     // await EmailService.sendRefundNotification(
//     //   refundResult.customerEmail,
//     //   refundResult.amount
//     // );

//     return {
//       success: true,
//       message: "Payment refunded successfully",
//       transactionId: refundResult.transactionId,
//       amount: refundResult.amount,
//     };
//   } catch (error) {
//     console.error("Refund error:", error);
//     throw error;
//   }
// }

// /**
//  * EXAMPLE 7: Retry Failed Payment
//  *
//  * Allow user to retry payment after failure
//  */
// export async function retryPaymentForRide(rideId: string, userId: string) {
//   try {
//     // Step 1: Get ride details
//     // const ride = await RideService.getRideById(rideId);

//     // Step 2: Check if ride is in pending payment state
//     // if (ride.status !== "PAYMENT_FAILED") {
//     //   throw new Error("Ride payment status does not allow retry");
//     // }

//     // Step 3: Get user details
//     // const user = await UserService.getUserById(userId);

//     // Step 4: Initiate new payment
//     const paymentResult = await PaymentService.initiatePayment({
//       userId: userId as any,
//       rideId: rideId as any,
//       amount: 5000, // ride.fare
//       currency: "BDT",
//       customerEmail: "user@example.com", // user.email
//       customerPhone: "01700000000", // user.phone
//       customerName: "John Doe", // user.name
//       description: `Retry payment for Ride ${rideId}`,
//     });

//     return {
//       success: true,
//       paymentUrl: paymentResult.paymentUrl,
//       transactionId: paymentResult.transactionId,
//       message: "Payment gateway opened for retry",
//     };
//   } catch (error) {
//     console.error("Payment retry error:", error);
//     throw error;
//   }
// }

// /**
//  * EXAMPLE 8: Payment Status Check
//  *
//  * Check the current status of a payment
//  */
// export async function checkPaymentStatus(transactionId: string) {
//   try {
//     const payment = await PaymentService.getPaymentDetails(transactionId);

//     return {
//       success: true,
//       transactionId: payment.transactionId,
//       status: payment.status,
//       amount: payment.amount,
//       currency: payment.currency,
//       sslTransactionId: payment.sslTransactionId,
//       paymentMethod: payment.paymentMethod,
//       createdAt: payment.createdAt,
//       updatedAt: payment.updatedAt,
//       errorMessage: payment.errorMessage || null,
//     };
//   } catch (error) {
//     console.error("Error checking payment status:", error);
//     throw error;
//   }
// }

// /**
//  * EXAMPLE 9: Wallet Top-up Payment
//  *
//  * Allow users to add funds to their wallet
//  */
// export async function initiateWalletTopUp(
//   userId: string,
//   topUpAmount: number,
//   userEmail: string,
//   userPhone: string,
//   userName: string
// ) {
//   try {
//     const paymentResult = await PaymentService.initiatePayment({
//       userId: userId as any,
//       amount: topUpAmount,
//       currency: "BDT",
//       customerEmail: userEmail,
//       customerPhone: userPhone,
//       customerName: userName,
//       description: `Wallet top-up of ${topUpAmount} BDT`,
//     });

//     // Note: You would update wallet balance after payment success
//     // This would be handled in the success callback

//     return {
//       success: true,
//       paymentUrl: paymentResult.paymentUrl,
//       transactionId: paymentResult.transactionId,
//       amount: topUpAmount,
//       message: "Proceed to payment gateway",
//     };
//   } catch (error) {
//     console.error("Wallet top-up error:", error);
//     throw error;
//   }
// }

// /**
//  * EXAMPLE 10: Payment Dashboard Data
//  *
//  * Get comprehensive payment data for user dashboard
//  */
// export async function getPaymentDashboardData(userId: string) {
//   try {
//     // Get history
//     const history = await PaymentService.getUserPaymentHistory(userId, 5, 0);

//     // Get stats
//     const stats = await PaymentService.getUserPaymentStats(userId);

//     // Calculate average transaction amount
//     const avgAmount =
//       stats.completedTransactions > 0
//         ? Math.round(stats.totalAmount / stats.completedTransactions)
//         : 0;

//     // Calculate success rate
//     const successRate =
//       stats.totalTransactions > 0
//         ? Math.round(
//             (stats.completedTransactions / stats.totalTransactions) * 100
//           )
//         : 0;

//     return {
//       recentTransactions: history.data,
//       statistics: {
//         totalAmount: stats.totalAmount,
//         completedTransactions: stats.completedTransactions,
//         failedTransactions: stats.failedTransactions,
//         totalTransactions: stats.totalTransactions,
//         averageAmount: avgAmount,
//         successRate: successRate,
//       },
//     };
//   } catch (error) {
//     console.error("Dashboard data error:", error);
//     throw error;
//   }
// }

// /**
//  * USAGE IN CONTROLLERS
//  *
//  * Example: In ride.controller.ts
//  *
//  * async completeRide = catchAsync(async (req: Request, res: Response) => {
//  *   const { rideId } = req.params;
//  *   const user = req.user as JwtPayload;
//  *
//  *   // Get ride details
//  *   const ride = await RideService.getRideById(rideId);
//  *
//  *   // Initiate payment
//  *   const paymentResult = await initiateRidePayment(
//  *     rideId,
//  *     user.id,
//  *     ride.fare,
//  *     {
//  *       email: user.email,
//  *       phone: user.phone,
//  *       name: user.name
//  *     }
//  *   );
//  *
//  *   sendResponse(res, {
//  *     statusCode: httpStatus.OK,
//  *     success: true,
//  *     message: "Proceed to payment",
//  *     data: paymentResult
//  *   });
//  * });
//  */
