import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { renderToReadableStream } from "react-dom/server";
import { generateGradient } from "../../../utils/gradient";

export const runtime = "edge";

export default async function handler(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const name = searchParams.get("name");
  const text = searchParams.get("text");
  const size = Number(searchParams.get("size") || "120");
  const rounded = Number(searchParams.get("rounded") || "0");

  const [username, type] = name?.split(".") || [];
  const fileType = type?.includes("svg") ? "svg" : "png";

  const gradient = await generateGradient(username || `${Math.random()}`);

  const avatar = (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <defs>
          {/* Main complex gradient with multiple stops */}
          <linearGradient
            id="mainGradient"
            x1={gradient.gradientDirection.x1}
            y1={gradient.gradientDirection.y1}
            x2={gradient.gradientDirection.x2}
            y2={gradient.gradientDirection.y2}
          >
            <stop offset="0%" stopColor={gradient.colors[0]} />
            <stop offset="33%" stopColor={gradient.colors[1]} />
            <stop offset="66%" stopColor={gradient.colors[2]} />
            <stop offset="100%" stopColor={gradient.colors[3]} />
          </linearGradient>

          {/* Mesh effect using multiple radial gradients */}
          <radialGradient id="mesh1" cx="20%" cy="20%" r="60%">
            <stop
              offset="0%"
              stopColor={gradient.colors[1]}
              stopOpacity="0.8"
            />
            <stop
              offset="100%"
              stopColor={gradient.colors[1]}
              stopOpacity="0"
            />
          </radialGradient>

          <radialGradient id="mesh2" cx="80%" cy="30%" r="70%">
            <stop
              offset="0%"
              stopColor={gradient.colors[2]}
              stopOpacity="0.6"
            />
            <stop
              offset="100%"
              stopColor={gradient.colors[2]}
              stopOpacity="0"
            />
          </radialGradient>

          <radialGradient id="mesh3" cx="30%" cy="80%" r="65%">
            <stop
              offset="0%"
              stopColor={gradient.colors[3]}
              stopOpacity="0.7"
            />
            <stop
              offset="100%"
              stopColor={gradient.colors[3]}
              stopOpacity="0"
            />
          </radialGradient>

          {/* Additional diagonal gradient for more complexity */}
          <linearGradient
            id="overlay"
            x1={gradient.gradientDirection.x2}
            y1={gradient.gradientDirection.y2}
            x2={gradient.gradientDirection.x1}
            y2={gradient.gradientDirection.y1}
          >
            <stop
              offset="0%"
              stopColor={gradient.colors[3]}
              stopOpacity="0.3"
            />
            <stop
              offset="50%"
              stopColor={gradient.colors[0]}
              stopOpacity="0.1"
            />
            <stop
              offset="100%"
              stopColor={gradient.colors[2]}
              stopOpacity="0.2"
            />
          </linearGradient>
        </defs>

        {/* Base rectangle with main gradient */}
        <rect
          fill="url(#mainGradient)"
          x="0"
          y="0"
          width={size}
          height={size}
          rx={rounded}
          ry={rounded}
        />

        {/* Mesh effect layers */}
        <rect
          fill="url(#mesh1)"
          x="0"
          y="0"
          width={size}
          height={size}
          rx={rounded}
          ry={rounded}
        />
        <rect
          fill="url(#mesh2)"
          x="0"
          y="0"
          width={size}
          height={size}
          rx={rounded}
          ry={rounded}
        />
        <rect
          fill="url(#mesh3)"
          x="0"
          y="0"
          width={size}
          height={size}
          rx={rounded}
          ry={rounded}
        />

        {/* Overlay gradient for extra depth */}
        <rect
          fill="url(#overlay)"
          x="0"
          y="0"
          width={size}
          height={size}
          rx={rounded}
          ry={rounded}
        />

        {fileType === "svg" && !!text ? (
          <text
            x="50%"
            y="50%"
            alignmentBaseline="central"
            dominantBaseline="central"
            textAnchor="middle"
            fill="#fff"
            fontFamily="sans-serif"
            fontSize={(size * 0.9) / text.length}
            style={{ filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.3))" }}
          >
            {text}
          </text>
        ) : null}
      </g>
    </svg>
  );

  if (fileType === "svg") {
    const stream = await renderToReadableStream(avatar);
    return new Response(stream, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=604800, immutable"
      }
    });
  }

  return new ImageResponse(avatar, {
    width: size,
    height: size
  });
}
