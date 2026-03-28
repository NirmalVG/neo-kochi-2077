import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Neo Kochi 2077",
    short_name: "Neo Kochi",
    description:
      "Meet Maaya inside a neon-soaked 3D Marine Drive simulation inspired by futuristic Kochi.",
    start_url: "/",
    display: "standalone",
    background_color: "#020202",
    theme_color: "#020202",
    orientation: "portrait",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  }
}
