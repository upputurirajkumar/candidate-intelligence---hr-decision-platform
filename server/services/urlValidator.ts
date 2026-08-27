import { URL } from 'url';

/**
 * SSRF & Malicious URL Protection Service
 * Validates candidate-submitted and user-submitted URLs
 * Blocks loopback, private networks, link-local, cloud metadata, and non-HTTP(S) schemes.
 */

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  'metadata.internal',
  '169.254.169.254',
  'instance-data',
]);

const BLOCKED_IP_PREFIXES = [
  '127.',        // Loopback IPv4
  '10.',         // Class A Private
  '192.168.',    // Class C Private
  '169.254.',    // Link-local / Cloud metadata
  '0.',          // Non-routable
  '::1',         // Loopback IPv6
  'fc00:',       // Unique local IPv6
  'fe80:',       // Link-local IPv6
];

export function isPrivateOrReservedIP(ip: string): boolean {
  // Check 172.16.0.0 - 172.31.255.255
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) {
    return true;
  }
  return BLOCKED_IP_PREFIXES.some(prefix => ip.startsWith(prefix));
}

export interface URLValidationResult {
  isValid: boolean;
  sanitizedUrl?: string;
  sourceCategory?: 'github' | 'linkedin' | 'portfolio' | 'other';
  error?: string;
}

export function validateExternalUrl(urlString: string): URLValidationResult {
  if (!urlString || typeof urlString !== 'string') {
    return { isValid: false, error: 'URL string is required.' };
  }

  const trimmed = urlString.trim();

  // Basic format sanity
  if (trimmed.length > 2048) {
    return { isValid: false, error: 'URL length exceeds maximum allowable length of 2048 characters.' };
  }

  // Prevent javascript: data: file: vbscript: protocols
  if (/^(javascript|data|file|vbscript|blob|about):/i.test(trimmed)) {
    return { isValid: false, error: 'Dangerous or unsupported URL protocol detected.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { isValid: false, error: 'Invalid URL structure.' };
  }

  // Only allow HTTP and HTTPS
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { isValid: false, error: `Protocol '${parsed.protocol}' is not permitted. Only 'https:' and 'http:' are supported.` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block forbidden hostnames
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { isValid: false, error: 'Access to internal or loopback hostnames is strictly forbidden.' };
  }

  // Block private/reserved IPs
  if (isPrivateOrReservedIP(hostname)) {
    return { isValid: false, error: 'Access to private or non-routable IP address ranges is strictly forbidden.' };
  }

  // Block internal domain suffixes
  if (
    hostname.endsWith('.internal') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.lan')
  ) {
    return { isValid: false, error: 'Internal network domains cannot be resolved.' };
  }

  // Categorize known safe platforms
  let sourceCategory: 'github' | 'linkedin' | 'portfolio' | 'other' = 'portfolio';
  if (hostname === 'github.com' || hostname.endsWith('.github.com')) {
    sourceCategory = 'github';
  } else if (hostname === 'linkedin.com' || hostname.endsWith('.linkedin.com')) {
    sourceCategory = 'linkedin';
  }

  return {
    isValid: true,
    sanitizedUrl: parsed.toString(),
    sourceCategory,
  };
}
