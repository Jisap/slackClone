import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password"; // Importamos el provider de password de convex auth para el login con credenciales
import { DataModel } from "./_generated/dataModel"

const CustomPassword = Password<DataModel>({                    // Creamos un provider de password personalizado
  profile(params){                                              // El profile recibe los params que se pasan al signIn
    return {                                                    // Devolvemos un objeto con el nombre y email del usuario
      email: params.email as string,
      name: params.name as string,
    }
  }
})

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [GitHub, Google, CustomPassword], // Las envs de los providers están almacenadas en convex 
});

