import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppProvider } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";
import { Intro } from "@/components/Intro";
import { Button } from "@/components/ui/button";
import { LocationFollower } from "@/components/LocationFollower";
import { TranslatorLoader } from "@/components/MoreLanguages";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-6xl">🌾</p>
        <h1 className="mt-4 text-2xl font-bold text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This field is empty. Let's head back home.</p>
        <Link to="/" className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Please try again.</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#eef4f0" },
      { title: "VERDIX — Your Smart Farming Companion" },
      { name: "description", content: "AI-powered farming assistant for crop planning, care and harvest, in English and Telugu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Telugu:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Outlet />
        <TranslatorLoader />
        <Toaster position="top-center" richColors />
        <Intro />
        <LocationFollower />
        <Button asChild size="icon" className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4 z-[60] size-14 rounded-full text-2xl shadow-lg animate-micpulse">
          <Link to="/assistant" aria-label="Open VERDIX AI" title="VERDIX AI">🤖</Link>
        </Button>
      </AppProvider>
    </QueryClientProvider>
  );
}
