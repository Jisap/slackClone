import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { useCallback, useMemo, useState } from "react"
import { Doc, Id } from '../../../../convex/_generated/dataModel';


type RequestType = {                              // Tipado de los argumentos de la mutation de convex
  body: string;
  id: Id<"messages"> 
};   
type ResponseType = Id<"messages"> | null;        // Tipado de respuesta esperado (un ID de message o null).

type Options = {                                  // Tipado de la funciones que se pueden pasar tras ejecutar la mutación, definidas en el modal
  onSuccess?: (data: ResponseType) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
}


export const useUpdateMessage = () => { // Hook para actualizar un message

  const [data, setData] = useState<ResponseType>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<"success" | "error" | "settled" | "pending" | null>(null);


  const isPending = useMemo(() => status === "pending", [status]); //
  const isSuccess = useMemo(() => status === "success", [status]);
  const isError = useMemo(() => status === "error", [status]);
  const isSettled = useMemo(() => status === "settled", [status]);

  const mutation = useMutation(api.messages.update) // Definición de la mutation de la api de convex para actualizar un message

  const mutate = useCallback(async (values: RequestType, options?: Options) => { // Ejecución de la mutation -> callbacks
    try {

      setData(null);
      setError(null);
      setStatus("pending")

      const response = await mutation(values);       // Cuando se usa la mutation en el modal, se pasa el id del message que se quiere actualizar y el body con la actualización
      options?.onSuccess?.(response)                 // Si se obtuvo una respuesta, se ejecuta la función de onSuccess definida en el modal con dicha respuesta
      return response

    } catch (error) {                                // Si ocurre algún error,           
      setStatus("error")
      options?.onError?.(error as Error)             // Se ejecuta la función de onError definida en el modal
      if (options?.throwError) {                     // Si throwError=true  se lanza un throw error que será recogido por el catch del modal al usar la mutation
        throw error;
      }
    } finally {                                        // Finalmente, se ejecuta la función de onSettled definida en el modal
      setStatus("settled")
      options?.onSettled?.()
    }
  }, [mutation]);

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