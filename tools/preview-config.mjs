export const previewHost = '0.0.0.0';
export const previewPort = 4173;

export function phoneAddresses(interfaces, port = previewPort) {
  const addresses = new Set();
  for (const entries of Object.values(interfaces)) {
    for (const entry of entries ?? []) {
      if (entry.internal || !['IPv4', 4].includes(entry.family)) continue;
      const octets = entry.address.split('.').map(Number);
      const privateAddress = octets[0] === 10 ||
        (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
        (octets[0] === 192 && octets[1] === 168);
      if (privateAddress) addresses.add(`http://${entry.address}:${port}/`);
    }
  }
  return [...addresses];
}
