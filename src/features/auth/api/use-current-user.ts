import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"


// hook para obtener el usuario actualmente logueado
export const useCurrentUser = () => {
  
  const data = useQuery(api.users.current); // Usamos la query de convex para obtener el usuario actualmente logueado apuntando al endpoint users.current
  const isLoading = data === undefined;

  return { data, isLoading}                 // Devolvemos el objeto del usuario actualmente logueado y un booleano que indica si se está cargando
}