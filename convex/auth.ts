import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password"; // Importamos el provider de password de convex auth para el login con credenciales



export const { auth, signIn, signOut, store } = convexAuth({
  providers: [GitHub, Google, Password], // Las envs de los providers están almacenadas en convex 
});

