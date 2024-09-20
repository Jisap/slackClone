import { convexAuthNextjsMiddleware, createRouteMatcher, isAuthenticatedNextjs, nextjsMiddlewareRedirect, } from "@convex-dev/auth/nextjs/server";

const isPublicPage = createRouteMatcher(["/auth"]);

export default convexAuthNextjsMiddleware((request) => {
  
  if(!isPublicPage(request) && !isAuthenticatedNextjs()){ // Cuando se hace por 1ª vez el login
    return nextjsMiddlewareRedirect(request, "/auth");
  }

  if(isPublicPage(request) && isAuthenticatedNextjs()){  // Cuando google o github te logean te redirigen al home y pasa por aquí
    return nextjsMiddlewareRedirect(request, "/");       // dejando entrar al usuario 
  }
  
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};