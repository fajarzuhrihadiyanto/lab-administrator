import React from "react";
import { useDisclosure } from "@chakra-ui/react";

export const SidebarContext = React.createContext()

const SidebarProvider = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <SidebarContext.Provider value={{ isOpen, onOpen, onClose }}>
            {children}
        </SidebarContext.Provider>
    )
}

export default SidebarProvider