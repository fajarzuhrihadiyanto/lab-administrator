'use client'

import React from "react"
import { HamburgerIcon } from "@chakra-ui/icons"
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Button,
    Flex,
    Heading,
    Link,
    Text,
    useDisclosure
} from "@chakra-ui/react"

import AdministrationRole from "components/roles/AdministrationRole"
import LabRole from "components/roles/LabRole"
import RoleNameForm from "components/roles/RoleNameForm"
import { SidebarContext } from "context/SidebarContext"
import useAuthStore from "store/useAuthStore"
import AlertDialogContainer from "components/ui/AlertDialogContainer"

const Page = () => {
    const { onOpen: onMenuOpen } = React.useContext(SidebarContext)

    const [ data, setData ] = React.useState([])
    const [ labData, setLabData ]  = React.useState([])
    const [ roleLabData, setRoleLabData ] = React.useState([])
    const [ isLoading, setIsLoading ] = React.useState(true)

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ alertData, setAlertData ] = React.useState({ title: '', message: '', isDangerous: false, cancelable: false, onConfirm: onClose})

    React.useEffect(() => {

        const fetchData = async () => {
            try {
                const urls = [
                    process.env.NEXT_PUBLIC_API_URL + '/roles',
                    process.env.NEXT_PUBLIC_API_URL + '/labs',
                    process.env.NEXT_PUBLIC_API_URL + '/role_labs'
                ]

                const responses = await Promise.all(urls.map(url => fetch(url)))

                const data = await Promise.all(responses.map(response => response.json()))

                setData(data[0].data.roles)
                setLabData(data[1].data.labs)
                setRoleLabData(data[2].data.roles_labs)
                setIsLoading(false)
            } catch (error) {
                onOpen()
                setAlertData({ title: 'Error', message: 'Client Error' })
            }
        }

        fetchData()

    }, [])

    return (
        <Flex direction='column' gap='32px'>
            <Box>
                <Flex gap='16px'>
                    <Button colorScheme='blue' padding='16px' onClick={onMenuOpen}><HamburgerIcon /></Button>
                    <Heading as='h1' size='xl' mb='32px'>Daftar Role</Heading>
                </Flex>
                {isLoading ? <Text>Loading</Text> : <>
                <Accordion allowMultiple allowToggle>
                    {data.map(role => (
                        <AccordionItem key={role.id}>
                            <AccordionButton>
                                <Heading as='h3' size='md' flex='1' textAlign='left'>
                                    {role.name}
                                </Heading>
                                
                                <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel>
                                <Flex direction="column" gap='32px'>
                                    <RoleNameForm role={role} setData={setData} />
                                    <AdministrationRole role={role} />
                                    <LabRole role={role} role_lab={roleLabData} labs={labData} />
                                </Flex>
                            </AccordionPanel>
                        </AccordionItem>
                    ))}
                </Accordion>
                </>}
            </Box>

            <Button as={Link} href='/admin/role' colorScheme='green'>Tambah Role</Button>

            <AlertDialogContainer isOpen={isOpen} onClose={onClose} title={alertData.title} message={alertData.message} />
        </Flex>
    )
}

export default Page