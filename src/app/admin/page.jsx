'use client'

import React from "react"
import { Button, Flex, Heading, Link } from "@chakra-ui/react"
import { HamburgerIcon } from "@chakra-ui/icons"
import jwt from "jsonwebtoken"

import { SidebarContext } from "context/SidebarContext"
import useAuthStore from "store/useAuthStore"

const Page = () => {
    const { onOpen } = React.useContext(SidebarContext)
    
    //#region ================== Extract menu from the token ==================
    const token = useAuthStore.useToken()
    const decodedToken = jwt.decode(token)
    const menu = decodedToken.access
    //#endregion =============== Extract menu from the token ==================

    //#region ================== Group menu by type ==================
    const administrativeMenu = menu.filter(item => item.type === 'administrative')
    const laboratoryMenu = menu.filter(item => item.type === 'laboratory')
    //#endregion =============== Group menu by type ==================
    return (
        <Flex direction='column' gap='32px'>
            <Flex gap='16px'>
                <Button colorScheme='blue' padding='16px' onClick={onOpen}><HamburgerIcon /></Button>
                <Heading as='h1' size='xl'>Halaman Administrator</Heading>
            </Flex>

            {administrativeMenu.length > 0 && (
                <Flex direction='column' gap='16px'>
                    <Heading as='h2' size='md'>Menu Administratif</Heading>
                    <Flex gap='16px'>
                        {administrativeMenu.map((item, index) => (
                            <Button padding='64px' key={index} as={Link} href={`/admin/${item.url}`}>{item.name}</Button>
                        ))}
                    </Flex>
                </Flex>
            )}

            {laboratoryMenu.length > 0 && laboratoryMenu.map((item, index) => (
                <Flex direction='column' gap='16px' key={index}>
                    <Heading as='h2' size='md'>Laboratorium {item.name}</Heading>
                    <Flex gap='16px'>
                        <Button padding='64px' as={Link} href={`/admin/lab/${item.lab_id}/facilities`}>Fasilitas</Button>
                        <Button padding='64px' as={Link} href={`/admin/lab/${item.lab_id}/professors`}>Dosen</Button>
                        <Button padding='64px' as={Link} href={`/admin/lab/${item.lab_id}/subjects`}>Mata Kuliah</Button>
                        <Button padding='64px' as={Link} href={`/admin/lab/${item.lab_id}/researches`}>Penelitian</Button>
                        <Button padding='64px' as={Link} href={`/admin/lab/${item.lab_id}/community_services`}>Pengabdian Masyarakat</Button>
                        <Button padding='64px' as={Link} href={`/admin/lab/${item.lab_id}/books`}>Buku</Button>
                    </Flex>
                </Flex>
            ))}

        </Flex>
    )
}

export default Page