// Google Analytics utilities
// Only runs on client-side, completely separate from backend

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Check if GA is enabled
export const isGAEnabled = !!GA_MEASUREMENT_ID;

// Track page views
export const pageview = (url: string) => {
  if (!isGAEnabled) return;
  
  window.gtag('config', GA_MEASUREMENT_ID as string, {
    page_path: url,
  });
};

// Track custom events
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (!isGAEnabled) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Declare gtag type for TypeScript
declare global {
  interface Window {
    gtag: (
      type: string,
      action: string,
      params?: Record<string, any>
    ) => void;
  }
}
