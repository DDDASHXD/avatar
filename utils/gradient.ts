import color from "tinycolor2";

async function hash(str: string): Promise<number> {
  let sum = 0;
  const buffer = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(str)
  );
  for (const n of new Uint8Array(buffer)) {
    sum += n;
  }
  return sum;
}

async function hue(str: string): Promise<number> {
  const n = await hash(str);
  return n % 360;
}

export async function generateGradient(username: string) {
  const h = await hue(username);
  const hashValue = await hash(username);
  const baseColor = color({ h, s: 0.85, l: 0.6 });

  // Generate multiple colors for a rich gradient
  const colors = [
    baseColor.toHexString(),
    baseColor.spin(90).saturate(10).lighten(10).toHexString(),
    baseColor.spin(180).saturate(15).darken(5).toHexString(),
    baseColor.spin(270).saturate(5).lighten(15).toHexString()
  ];

  // Generate randomized gradient direction based on username
  const angle = (hashValue % 360) * (Math.PI / 180); // Convert to radians
  const gradientDirection = {
    x1: Math.cos(angle + Math.PI) * 0.5 + 0.5,
    y1: Math.sin(angle + Math.PI) * 0.5 + 0.5,
    x2: Math.cos(angle) * 0.5 + 0.5,
    y2: Math.sin(angle) * 0.5 + 0.5
  };

  // Create mesh-like gradient positions (also slightly randomized)
  const meshPositions = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0.3, y: 0.7 },
    { x: 0.8, y: 0.4 },
    { x: 0.2, y: 1 },
    { x: 1, y: 1 }
  ];

  return {
    colors,
    gradientDirection,
    meshPositions
  };
}
