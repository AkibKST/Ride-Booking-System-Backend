import { envVars } from "./env";

/**
 * @file ssl-commerz.config.ts
 * @description SSL Commerz configuration and constants
 * Centralizes all SSL Commerz related configuration settings
 *
 * Environment variables required:
 * - SSL_COMMERZ_STORE_ID: Your SSL Commerz store ID
 * - SSL_COMMERZ_STORE_PASSWORD: Your SSL Commerz store password
 * - SSL_COMMERZ_API_BASE_URL: SSL Commerz API endpoint (sandbox or production)
 * - APP_BASE_URL: Your application base URL for callbacks
 */

/**
 * @interface SSLCommerzConfig
 * @description Configuration object for SSL Commerz integration
 */
export interface SSLCommerzConfig {
  /**
   * Store ID provided by SSL Commerz
   */
  storeId: string;

  /**
   * Store password provided by SSL Commerz
   */
  storePassword: string;

  /**
   * Base URL for SSL Commerz API endpoints
   * Production: https://securepay.sslcommerz.com
   * Sandbox: https://sandbox.sslcommerz.com
   */
  apiBaseUrl: string;

  /**
   * Application base URL for payment callbacks
   * Example: https://yourdomain.com or http://localhost:3000
   */
  appBaseUrl: string;

  /**
   * Validation endpoint path
   */
  validationEndpoint: string;

  /**
   * Payment gateway initialization endpoint
   */
  initializationEndpoint: string;
}

/**
 * Initialize SSL Commerz configuration from environment variables
 */
export const sslCommerzConfig: SSLCommerzConfig = {
  storeId: envVars.SSL_COMMERZ_STORE_ID || "",
  storePassword: envVars.SSL_COMMERZ_STORE_PASSWORD || "",
  apiBaseUrl:
    envVars.SSL_COMMERZ_API_BASE_URL || "https://sandbox.sslcommerz.com",
  appBaseUrl: envVars.APP_BASE_URL || "http://localhost:3000",
  validationEndpoint: "/api/v1/payment/validate",
  initializationEndpoint: "/api/v1/payment/request",
};

/**
 * SSL Commerz API endpoints
 */
export const SSL_COMMERZ_ENDPOINTS = {
  /**
   * Initialize/initiate payment request
   * POST request to generate payment gateway URL
   */
  INIT_PAYMENT: "/gwprocess/v4/api.php",

  /**
   * Validate payment after completion
   * POST request to validate transaction with SSL Commerz
   */
  VALIDATE_PAYMENT: "/validator/api/validationApi.php",

  /**
   * Check payment status
   * POST request to check transaction status
   */
  TRANSACTION_STATUS: "/validator/api/transactionQueryApi.php",
};

/**
 * Supported payment methods by SSL Commerz
 */
export const PAYMENT_METHODS = {
  CARD: "CARD",
  BKASH: "BKASH",
  NAGAD: "NAGAD",
  ROCKET: "ROCKET",
  BANK_TRANSFER: "BANK_TRANSFER",
  INTERNET_BANKING: "INTERNET_BANKING",
};

/**
 * Payment status mapping
 */
export const PAYMENT_STATUS = {
  VALID: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  PENDING: "PENDING",
  DEFAULT: "INITIATED",
} as const;

/**
 * Product profiles for SSL Commerz
 * Different product categories have different rates
 */
export const PRODUCT_PROFILES = {
  PHYSICAL_GOODS: "physical-goods",
  DIGITAL_GOODS: "digital-goods",
  SERVICE: "service",
  AIRLINE: "airline",
  TRAVEL: "travel",
  HOSPITALITY: "hospitality",
};

/**
 * Shipping methods
 */
export const SHIPPING_METHODS = {
  HOME_DELIVERY: "01",
  OFFICE_DELIVERY: "02",
  COURIER: "03",
  PICKUP_POINT: "04",
};

/**
 * Error codes from SSL Commerz
 */
export const SSL_COMMERZ_ERROR_CODES = {
  INVALID_AMOUNT: "1001",
  INVALID_STORE_ID: "1002",
  INVALID_REQUEST: "1003",
  SESSION_EXPIRED: "1004",
  PAYMENT_FAILED: "1005",
  INVALID_CURRENCY: "1006",
  DUPLICATE_TRANSACTION: "1007",
  API_ERROR: "5000",
} as const;
