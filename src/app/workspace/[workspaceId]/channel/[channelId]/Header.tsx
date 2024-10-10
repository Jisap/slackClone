

interface HeaderProps {
  name: string
}

export const Header = ({ name }: HeaderProps) => {
  return (
    <div>{name}</div>
  )
}
