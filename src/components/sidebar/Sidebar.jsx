import React, { useContext } from 'react'
import jwt from 'jsonwebtoken'
import {
    Button,
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    Heading,
    Text,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    Link,
    Flex,
    AccordionIcon,
    Box,
} from '@chakra-ui/react'

import useAuthStore from 'src/store/useAuthStore'
import { SidebarContext } from 'src/context/SidebarContext'

const Menu = ({ type }) => {
    //#region ============ Extract menu from token ============
    const token = useAuthStore.useToken()
    const decodedToken = jwt.decode(token)
    const menu = decodedToken.access
    //#endregion ========= Extract menu from token ============

    return menu
        // filter menu based on type
        .filter(item => item.type === type)
        .map((item) => {
            if (type === 'administrative')
                return <Link as={Link} href={`/admin/${item.url}`}>{item.name}</Link>
            if (type === 'laboratory')
                return (
                <AccordionItem>
                    <AccordionButton>
                        <Box as='span' flex='1' textAlign='left'>
                            Laboratorium {item.alias}
                        </Box>
                        <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel>
                        <Flex direction='column' gap={'16px'}>
                            <Link as={Link} href={`/admin/lab/${item.lab_id}/facilities`}>Fasilitas</Link>
                            <Link as={Link} href={`/admin/lab/${item.lab_id}/professors`}>Dosen</Link>
                            <Link as={Link} href={`/admin/lab/${item.lab_id}/subjects`}>Mata Kuliah</Link>
                            <Link as={Link} href={`/admin/lab/${item.lab_id}/researches`}>Penelitian</Link>
                            <Link as={Link} href={`/admin/lab/${item.lab_id}/community_services`}>Pengabdian Masyarakat</Link>
                            <Link as={Link} href={`/admin/lab/${item.lab_id}/books`}>Buku</Link>
                        </Flex>
                    </AccordionPanel>
                </AccordionItem>
            )
        })
}


const Sidebar = () => {
    const { isOpen, onClose } = useContext(SidebarContext)
    const user = useAuthStore.useUser()
    const logout = useAuthStore.useLogout()

    return (
        <Drawer
            isOpen={isOpen}
            placement='left'
            onClose={onClose}
        >
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>
                    <Heading as='h3' size='lg'>{user.fullname}</Heading>
                    <Text>{user.role}</Text>
                </DrawerHeader>

                <DrawerBody>
                    <Flex direction={'column'} gap='16px' alignItems={'stretch'}>
                        <Link as={Link} href='/admin'>Dashboard</Link>
                        <Menu type='administrative' />
                        <Accordion allowToggle allowMultiple>
                            <Menu type='laboratory' />
                        </Accordion>
                    </Flex>
                </DrawerBody>

                <DrawerFooter>
                    <Button colorScheme='red' onClick={logout}>Logout</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default Sidebar