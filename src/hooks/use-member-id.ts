import { useParams } from "next/navigation";
import { Id } from '../../convex/_generated/dataModel';


export const useMemberId = () => {

  const params = useParams();                          // Obtenemos los parámetros de la URL
  return params.memberId as Id<"members">              // Devolvemos el id del member contenido en el parámetro
}