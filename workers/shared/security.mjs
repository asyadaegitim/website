/**
 * Response hardening shared by the two domain Workers and Workers Static Assets.
 * CSP stays Report-Only until violation logs and form/font/image behavior are reviewed.
 * HSTS is intentionally host-scoped for one day (no includeSubDomains/preload).
 */
export const SECURITY_HEADERS=Object.freeze({
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'strict-origin-when-cross-origin',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'X-Frame-Options':'DENY',
  'Strict-Transport-Security':'max-age=86400',
  'Content-Security-Policy-Report-Only':[
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://formsubmit.co",
    "form-action 'self' https://formsubmit.co",
  ].join('; ')
});
export function withSecurityHeaders(response,{noindex=false}={}){
  const headers=new Headers(response.headers);
  for(const [key,value] of Object.entries(SECURITY_HEADERS))headers.set(key,value);
  if(noindex)headers.set('X-Robots-Tag','noindex, nofollow');
  return new Response(response.body,{
    status:response.status,
    statusText:response.statusText,
    headers
  });
}
export function staticAssetsHeaders(){
  return '/*\n'+Object.entries(SECURITY_HEADERS).map(([key,value])=>'  '+key+': '+value+'\n').join('');
}
