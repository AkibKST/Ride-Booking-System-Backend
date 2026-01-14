import { z } from "zod";

/**
 * @schema InitiatePaymentSchema
 * @description Zod validation schema for initiating a payment
 * Validates all required fields before processing payment request
 */
export const InitiatePaymentSchema = z.object({
  body: z.object({
    /**
     * User ID initiating the payment (MongoDB ObjectId)
     */
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),

    /**
     * Optional Ride ID associated with payment
     */
    rideId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid ride ID format")
      .optional(),

    /**
     * Payment amount in BDT
     * Minimum 1 (1 paisa) to prevent zero-amount transactions
     */
    amount: z
      .number()
      .min(1, "Amount must be at least 1")
      .max(999999999, "Amount exceeds maximum limit"),

    /**
     * Currency code (ISO 4217)
     * Defaults to BDT (Bangladeshi Taka)
     */
    currency: z.enum(["BDT", "USD", "EUR", "GBP"]).default("BDT"),

    /**
     * Customer email for payment notifications
     * Must be valid email format
     */
    customerEmail: z.string().email("Invalid email address"),

    /**
     * Customer phone number for payment
     * Must be 10-15 digits
     */
    customerPhone: z
      .string()
      .regex(/^\d{10,15}$/, "Invalid phone number format"),

    /**
     * Customer name (full name)
     * Between 2-100 characters
     */
    customerName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100),

    /**
     * Optional payment description/purpose
     */
    description: z.string().optional(),
  }),
});

/**
 * @schema PaymentValidationSchema
 * @description Zod validation schema for validating payment with SSL Commerz
 * Used when SSL Commerz returns validation response
 */
export const PaymentValidationSchema = z.object({
  query: z.object({
    /**
     * SSL Commerz validation ID from their response
     */
    val_id: z.string().nonempty("Validation ID is required"),

    /**
     * Transaction amount for verification
     */
    amount: z.string().nonempty("Amount is required"),
  }),
});

/**
 * @schema IPNWebhookSchema
 * @description Zod validation schema for IPN (Instant Payment Notification) webhook
 * Validates SSL Commerz webhook callback data
 */
export const IPNWebhookSchema = z.object({
  body: z.object({
    /**
     * Transaction ID from SSL Commerz
     */
    tran_id: z.string().nonempty("Transaction ID is required"),

    /**
     * Payment status (VALID, FAILED, etc.)
     */
    status: z.string(),

    /**
     * Payment amount
     */
    amount: z.string(),

    /**
     * Currency code
     */
    currency: z.string(),

    /**
     * Custom value A - used to store our transaction ID
     */
    value_a: z.string().optional(),

    /**
     * Custom value B
     */
    value_b: z.string().optional(),

    /**
     * Custom value C
     */
    value_c: z.string().optional(),

    /**
     * Custom value D
     */
    value_d: z.string().optional(),

    /**
     * SSL Commerz validation ID
     */
    val_id: z.string().optional(),

    /**
     * Payment method used
     */
    card_type: z.string().optional(),

    /**
     * Last 4 digits of card
     */
    card_no: z.string().optional(),

    /**
     * Card issuer information
     */
    card_issuer: z.string().optional(),

    /**
     * Error code if transaction failed
     */
    error_code: z.string().optional(),

    /**
     * Error message if transaction failed
     */
    error_message: z.string().optional(),
  }),
});

/**
 * Export types for use in controllers and services
 */
export type InitiatePaymentInput = z.infer<typeof InitiatePaymentSchema>;
export type PaymentValidationInput = z.infer<typeof PaymentValidationSchema>;
export type IPNWebhookInput = z.infer<typeof IPNWebhookSchema>;
