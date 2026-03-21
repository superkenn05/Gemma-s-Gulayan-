
import emailjs from '@emailjs/browser';

/**
 * Service to handle Gmail notifications via EmailJS.
 * 
 * SECURITY NOTE: These keys are provided as fallbacks.
 * For production, set them as Environment Variables in your hosting provider
 * using the keys: NEXT_PUBLIC_EMAILJS_SERVICE_ID, NEXT_PUBLIC_EMAILJS_TEMPLATE_ID, 
 * NEXT_PUBLIC_EMAILJS_PUBLIC_KEY.
 */

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_m3u0lak'; 
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_elfn3i8'; 
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'LgsL-WpeeQSNt7oK5'; 

export interface EmailParams {
  to_name: string;
  to_email: string;
  order_id: string;
  status: string;
  total_amount: string;
  items_summary: string;
  message?: string;
  [key: string]: any;
}

/**
 * Sends an order notification email using EmailJS.
 */
export async function sendOrderEmail(params: EmailParams) {
  try {
    // Basic validation
    if (!params.to_email) {
      console.warn('Skipping email: No recipient email address provided.');
      return null;
    }

    // Ensure EmailJS is initialized with the Public Key
    // This is critical to prevent 401/403/422 errors
    emailjs.init(EMAILJS_PUBLIC_KEY);

    const templateParams = {
      to_name: params.to_name || 'Valued Customer',
      to_email: params.to_email,
      order_id: params.order_id,
      status: params.status,
      total_amount: params.total_amount,
      items_summary: params.items_summary,
      message: params.message || 'No additional details provided.',
      reply_to: 'support@gemmasgulayan.com',
    };

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY // Passing it here as well for redundancy
    );

    console.log('Email successfully sent!', result.status, result.text);
    return result;
  } catch (error: any) {
    // 422 often means the Service ID or Template ID is incorrect, or the Public Key isn't recognized
    console.error('EmailJS Error Status:', error?.status);
    console.error('EmailJS Error Text:', error?.text || 'Unknown EmailJS error');
    
    // We throw the error so callers can handle it if needed
    throw error;
  }
}
