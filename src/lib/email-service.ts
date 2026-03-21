
import emailjs from '@emailjs/browser';

/**
 * Service to handle Gmail notifications via EmailJS.
 * 
 * Verified Credentials from User Dashboard:
 * Service ID: service_m3u0lak
 * Template ID: template_elfn3i8
 * Public Key: Y8iTIL9FJmruqJJrj
 */

const EMAILJS_SERVICE_ID = 'service_m3u0lak'; 
const EMAILJS_TEMPLATE_ID = 'template_elfn3i8'; 
const EMAILJS_PUBLIC_KEY = 'Y8iTIL9FJmruqJJrj'; 

// Initialize EmailJS globally once at the module level.
// This is the most reliable way to ensure the Public Key is recognized.
emailjs.init(EMAILJS_PUBLIC_KEY);

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

    // Map parameters to match your EmailJS Template variables exactly.
    const templateParams = {
      to_name: String(params.to_name || 'Valued Customer').trim(),
      to_email: String(params.to_email).trim(),
      order_id: String(params.order_id).trim(),
      status: String(params.status).trim(),
      total_amount: String(params.total_amount).trim(),
      items_summary: String(params.items_summary).trim(),
      message: String(params.message || 'No additional details provided.').trim(),
    };

    console.log('Attempting to send email via Service:', EMAILJS_SERVICE_ID);

    // Using the initialized SDK to send the message.
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('Email sent successfully:', result.status, result.text);
    return result;
  } catch (error: any) {
    // 422 Unprocessable Entity usually means the ID/Key combination is rejected by EmailJS.
    console.error('EmailJS Error Status:', error?.status);
    console.error('EmailJS Error Text:', error?.text || 'Unknown EmailJS error');
    
    if (error?.status === 422) {
      console.error('DIAGNOSTIC: Error 422 indicates that Service ID "service_m3u0lak" or Template ID "template_elfn3i8" is not associated with Public Key "Y8iTIL9FJmruqJJrj" in your EmailJS dashboard.');
    }
    
    throw error;
  }
}
