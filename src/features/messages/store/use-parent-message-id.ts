import { useQueryState } from "nuqs";           // En lugar de almacenar el estado en el componente, Nuqs lo coloca directamente en la URL

export const useParentMessageId = () => {       // Cuando se llame a useParentMessageId, se obtendrá un estado 
  return useQueryState("parentMessageId")       // y una función para actualizar el valor de parentMessageId en la URL.
}