import { convexAuthNextjsMiddleware, createRouteMatcher, isAuthenticatedNextjs, nextjsMiddlewareRedirect, } from "@convex-dev/auth/nextjs/server";

const isPublicPage = createRouteMatcher(["/auth"]);

export default convexAuthNextjsMiddleware((request) => {
  if(!isPublicPage(request) && !isAuthenticatedNextjs()){
    return nextjsMiddlewareRedirect(request, "/auth");
  }
  // TODO: Redirect user away from "/auth" if they are already authenticated
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};