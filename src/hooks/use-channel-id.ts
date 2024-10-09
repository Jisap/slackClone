import { useParams } from "next/navigation";
import { Id } from '../../convex/_generated/dataModel';


export const useChannelId = () => {

  const params = useParams();                          // Obtenemos los parámetros de la URL
  return params.channelId as Id<"channels">            // Devolvemos el id del channel contenido en el parámetro
}