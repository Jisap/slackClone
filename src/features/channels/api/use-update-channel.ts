import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { useCallback, useMemo, useState } from "react"
import { Id } from "../../../../convex/_generated/dataModel";


type RequestType = { 
  name: string;
  id: Id<"channels">                                      // Tipado de los argumentos de la mutation de convex
};              
type ResponseType = Id<"channels"> | null | Error;        // Tipado de respuesta esperado (un ID de channels o null).

type Options = {                                          // Tipado de la funciones que se pueden pasar tras ejecutar la mutación, definidas en el modal
  onSuccess?: (data: ResponseType) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
}


export const useUpdateChannel = () => { // Hook para actualizar el nombre de un channel

  const [data, setData] = useState<ResponseType>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<"success" | "error" | "settled" | "pending" | null>(null);
 

  const isPending = useMemo(() => status === "pending", [status]); //
  const isSuccess = useMemo(() => status === "success", [status]);
  const isError = useMemo(() => status === "error", [status]);
  const isSettled = useMemo(() => status === "settled", [status]);

  const mutation = useMutation(api.channels.update) // Definición de la mutation de la api de convex para crear un channel

  const mutate = useCallback(async(values:RequestType, options?: Options) => { // Ejecución de la mutation -> callbacks
    try {
      
      setData(null);
      setError(null);
      setStatus("pending")                           
      
      const response = await mutation(values);       // Cuando se usa la mutation en el modal, se pasa el nombre del channel y el workspaceId
      options?.onSuccess?.(response)                 // Si se obtuvo una respuesta, se ejecuta la función de onSuccess definida en el modal con dicha respuesta
      return response
      
    } catch (error) {                                // Si ocurre algún error,           
      setStatus("error")
      options?.onError?.(error as Error)             // Se ejecuta la función de onError definida en el modal
      if (options?.throwError) {                     // Si throwError=true  se lanza un throw error que será recogido por el catch del modal al usar la mutation
        throw error;
      }
    }finally{                                        // Finalmente, se ejecuta la función de onSettled definida en el modal
      setStatus("settled")
      options?.onSettled?.()
    }
  },[mutation]);

  return {
    mutate,
    data,
    error,
    isPending,
    isSuccess,
    isError,
    isSettled,

  }
}