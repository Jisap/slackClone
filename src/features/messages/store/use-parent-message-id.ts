import { useQueryState } from "nuqs";           


// useParentMessageId es un hook que obtiene el valor de parentMessageId de la URL y lo almacena en el estado.

export const useParentMessageId = () => {       // Cuando se llame a useParentMessageId, se obtendrá un estado 
  return useQueryState("parentMessageId")       // y una función para actualizar el valor de parentMessageId en la URL.
}