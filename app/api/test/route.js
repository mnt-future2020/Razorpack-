export async function GET() {
  // Diagnostic endpoint — never expose stack/config state in production.
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }
  return Response.json({
    message: "Backend working",
    env_status: {
      MONGO_URL: process.env.MONGO_URL ? "Loaded" : "Missing",
      JWT_SECRET: process.env.JWT_SECRET ? "Loaded" : "Missing",
      APP_URL: process.env.APP_URL || "Missing",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "Missing",
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? "Loaded" : "Missing",
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? "Loaded" : "Missing",
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? "Loaded" : "Missing",
      SMTP_HOST: process.env.SMTP_HOST ? "Loaded" : "Missing",
      SMTP_USER: process.env.SMTP_USER ? "Loaded" : "Missing",
      SMTP_PASS: process.env.SMTP_PASS ? "Loaded" : "Missing",
      NODE_ENV: process.env.NODE_ENV || "Missing",
      PORT: process.env.PORT || "Missing",
    },
  });
}
