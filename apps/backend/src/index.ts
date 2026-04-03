import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "@devport/auth/server";
import { profileRoutes } from "./routes/profile";
import { projectRoutes } from "./routes/projects";
import { certificateRoutes } from "./routes/certificates";
import { eventRoutes } from "./routes/events";
import { githubRoutes } from "./routes/github";
import { messageRoutes } from "./routes/messages";
import { seoRoutes } from "./routes/seo";
import { uploadRoutes } from "./routes/upload";
import { portfolioPublicRoutes } from "./routes/portfolio";
import { adminRoutes } from "./routes/admin";

const origins = [
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3003",
  process.env.NEXT_PUBLIC_PORTFOLIO_URL ?? "http://localhost:3002",
  process.env.NEXT_PUBLIC_WEBSITE_URL ?? "http://localhost:3004",
];

const app = new Elysia()
  .use(
    cors({
      origin: origins,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .mount(auth.handler)
  .use(portfolioPublicRoutes)
  .use(profileRoutes)
  .use(projectRoutes)
  .use(certificateRoutes)
  .use(eventRoutes)
  .use(githubRoutes)
  .use(messageRoutes)
  .use(seoRoutes)
  .use(uploadRoutes)
  .use(adminRoutes)
  .get("/health", () => ({ ok: true }))
  .listen(3001);

console.log(`Backend listening on http://localhost:${app.server?.port}`);
