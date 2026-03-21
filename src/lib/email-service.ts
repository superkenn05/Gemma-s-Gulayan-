
import emailjs from '@emailjs/browser';

/**
 * Service to handle Gmail notifications via EmailJS.
 * 
 * Verified Credentials:
 * Service ID: service_m3u0lak
 * Template ID: template_kt9xc39
 * Public Key: Y8iTIL9FJmruqJJrj
 */

const EMAILJS_SERVICE_ID = 'service_m3u0lak'; 
const EMAILJS_TEMPLATE_ID = 'template_kt9xc39'; 
const EMAILJS_PUBLIC_KEY = 'Y8iTIL9FJmruqJJrj'; 

export interface EmailParams {
  email: string; // The recipient's email
  customer_name: string; // {{customer_name}}
  order_id: string; // {{order_id}}
  order_date: string; // {{order_date}}
  total_amount: string; // {{total_amount}}
  order_items: string; // {{order_items}}
  [key: string]: any;
}

/**
 * Sends an order notification email using EmailJS.
 */
export async function sendOrderEmail(params: EmailParams) {
  try {
    // Prevent sending if the email is invalid
    if (!params.email || !params.email.includes('@')) {
      console.warn('Skipping email: Invalid recipient address.');
      return null;
    }

    const templateParams = {
      email: params.email,
      customer_name: params.customer_name,
      order_id: params.order_id,
      order_date: params.order_date,
      total_amount: params.total_amount,
      order_items: params.order_items,
    };

    /**
     * IMPORTANT: In EmailJS v4, the 4th argument MUST be an options object
     * containing the publicKey. Passing it as a string (v3 style) causes 422 errors.
     */
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: EMAILJS_PUBLIC_KEY,
      }
    );

    return result;
  } catch (error: any) {
    // Log detailed error information to help with dashboard configuration
    console.error('EmailJS Error Status:', error?.status);
    console.error('EmailJS Error Text:', error?.text || 'Unknown EmailJS error');
    throw error;
  }
}
