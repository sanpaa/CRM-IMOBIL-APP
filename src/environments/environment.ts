export const environment = {
  production: false,
  apiUrl: 'https://crm-imobil.onrender.com/api',
  supabase: {
    url: 'https://ogixrlwohcwdhitigpta.supabase.co',
    anonKey: 'sb_publishable_XlTekaoGb0PkW17rmnwZ5Q_7RCoemu5'
  },
  // Multi-tenant configuration
  tenant: {
    // Base domain for automatic subdomains (e.g., company1.yoursite.com)
    baseDomain: 'yoursite.com', // TODO: Change this to your actual domain
    // Netlify/Vercel site URL for DNS configuration
    deploymentUrl: 'your-site.netlify.app' // TODO: Change this after first deployment
  }
};
