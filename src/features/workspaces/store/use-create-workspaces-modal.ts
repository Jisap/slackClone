

import { atom, useAtom } from "jotai"

const modalState = atom(false);                 // Estado del modal de creación de workspaces (boolean)

export const useCreateWorkspacesModal = () => { // Hook para acceder al estado del modal de creación de workspaces
  return useAtom(modalState);
}

