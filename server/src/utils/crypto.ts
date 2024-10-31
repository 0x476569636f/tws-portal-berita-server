export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return (await hashPassword(password)) === hash;
}

// Test code expected output: true

// const testPassword = "password";
// const testHash = await hashPassword(testPassword);
// const testVerify = await verifyPassword(testPassword, testHash);
// console.log(testVerify);
