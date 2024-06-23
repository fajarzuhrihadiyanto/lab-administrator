'use client'

import { Box } from "@chakra-ui/react"

import Sidebar from "components/sidebar/Sidebar"
import SidebarProvider from "context/SidebarContext"
import IsAuth from "utils/isAuth"

const Layout = ({ children }) => {
    return (
        <SidebarProvider>
            <Box padding='64px'>
                <nav><Sidebar /></nav>
                <main>{children}</main>
            </Box>
        </SidebarProvider>
    )
}

export default IsAuth(Layout)