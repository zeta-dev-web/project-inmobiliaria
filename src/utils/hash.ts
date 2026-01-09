export async function generateTransactionHash(data: {
  rentalId: string;
  amount: number;
  paymentDate: Date;
  signedById: number;
}): Promise<string> {
  const text = `${data.rentalId}-${data.amount}-${data.paymentDate.toISOString()}-${data.signedById}-${Date.now()}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
