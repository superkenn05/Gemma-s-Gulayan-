import emailjs from '@emailjs/browser';

/**
 * Service to handle Gmail notifications via EmailJS.
 * 
 * SECURITY NOTE: These keys are currently provided as fallbacks.
 * To fully secure these and prevent GitHub from blocking your pushes,
 * set them as Environment Variables in your hosting provider
 * (e.g., Firebase App Hosting) using the keys:
 * NEXT_PUBLIC_EMAILJS_SERVICE_ID, NEXT_PUBLIC_EMAILJS_TEMPLATE_ID, NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
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
 * Awaited in checkout to ensure delivery attempts finish before navigation.
 */
export async function sendOrderEmail(params: EmailParams) {
  try {
    if (!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY === 'LgsL-WpeeQSNt7oK5') {
      // Logic for developers to know if they need to set keys
      if (EMAILJS_PUBLIC_KEY === 'your_public_key') {
        console.warn('EmailJS not configured. Please set your environment variables.');
        return null;
      }
    }

    if (!params.to_email) {
      console.warn('Skipping email: No recipient email address provided.');
      return null;
    }

    const templateParams = {
      ...params,
      reply_to: 'support@gemmasgulayan.com',
    };

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('Email sent successfully:', result.status, result.text);
    return result;
  } catch (error: any) {
    // Improved error logging to capture the actual response from EmailJS
    console.error('EmailJS Error Status:', error?.status);
    console.error('EmailJS Error Text:', error?.text || 'Unknown error');
    
    // We throw the error so callers can handle it if needed
    throw error;
  }
}
