
import emailjs from '@emailjs/browser';

/**
 * Service to handle Gmail notifications via EmailJS.
 * 
 * Verified Credentials:
 * Service ID: service_m3u0lak
 * Template ID: template_elfn3i8
 * Public Key: Y8iTIL9FJmruqJJrj
 */

const EMAILJS_SERVICE_ID = 'service_m3u0lak'; 
const EMAILJS_TEMPLATE_ID = 'template_elfn3i8'; 
const EMAILJS_PUBLIC_KEY = 'Y8iTIL9FJmruqJJrj'; 

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
    if (!params.to_email || !params.to_email.includes('@')) {
      console.warn('Skipping email: Invalid or missing recipient email address.');
      return null;
    }

    // Map parameters to match your EmailJS Template variables.
    const templateParams = {
      to_name: String(params.to_name || 'Valued Customer').trim(),
      to_email: String(params.to_email).trim(),
      order_id: String(params.order_id).trim(),
      status: String(params.status).trim(),
      total_amount: String(params.total_amount).trim(),
      items_summary: String(params.items_summary).trim(),
      message: String(params.message || 'No additional details provided.').trim(),
    };

    // Diagnostic log
    console.log('Sending email with Service:', EMAILJS_SERVICE_ID, 'to:', templateParams.to_email);

    // Using the v4 recommended pattern: passing public key in the options object.
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: EMAILJS_PUBLIC_KEY,
      }
    );

    console.log('Email sent successfully:', result.status, result.text);
    return result;
  } catch (error: any) {
    // 422 often means the Service ID or Template ID is incorrect, or the Public Key isn't recognized
    console.error('EmailJS Error Status:', error?.status);
    console.error('EmailJS Error Text:', error?.text || 'Unknown EmailJS error');
    
    if (error?.status === 422) {
      console.error('DIAGNOSTIC: A 422 error usually means your Template ID "template_elfn3i8" or Public Key "Y8iTIL9FJmruqJJrj" does not match the dashboard settings for service "service_m3u0lak".');
    }
    
    throw error;
  }
}
