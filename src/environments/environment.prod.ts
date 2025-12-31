export const environment = {
  production: true,
  supabase: {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
  },
  // Multi-tenant configuration
  tenant: {
    // Base domain for automatic subdomains (e.g., company1.yoursite.com)
    baseDomain: 'yoursite.com', // TODO: Change this to your actual domain
    // Netlify/Vercel site URL for DNS configuration
    deploymentUrl: 'your-site.netlify.app' // TODO: Change this after first deployment
  }
};
