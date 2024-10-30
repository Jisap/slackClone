import { Doc, Id } from "../../convex/_generated/dataModel";

interface ReactionsProps {
  data: Array<
    Omit<Doc<"reactions">, "memberId"> & { // Se omite el campo "memberId" de cada reacción
      count: number;                       // y se le añade el objeto que contiene el número de reacciones
      memberIds: Id<"members">[]           // y un array de miembros que hicieron la reacción 
    }
  >
  onChange: (value: string) => void
}

export const Reactions = ({ data, onChange }: ReactionsProps) => {
  return (
    <div>
      Reactions!
    </div>
  )
}

export default Reactions