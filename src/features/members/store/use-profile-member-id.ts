import { useQueryState } from "nuqs";           


// useProfileMemberId es un hook que obtiene el valor de profileMemberId de la URL y lo almacena en el estado.

export const useProfileMemberId = () => {       // Cuando se llame a useProfileMemberId, se obtendrá un estado 
  return useQueryState("profileMemberId")       // y una función para actualizar el valor de profileMemberId en la URL.
}