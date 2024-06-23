'use client'

import React from "react"
import { HamburgerIcon } from "@chakra-ui/icons"
import { Button, Flex, Heading, Link, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useDisclosure } from "@chakra-ui/react"

import AlertDialogContainer from "components/ui/AlertDialogContainer"
import { SidebarContext } from "context/SidebarContext"
import useAuthStore from "store/useAuthStore"

const Page = () => {
    const token = useAuthStore.useToken()

    const { onOpen: onMenuOpen } = React.useContext(SidebarContext)

    const [ data, setData ] = React.useState([])

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ alertData, setAlertData ] = React.useState({ title: '', message: '', isDangerous: false, cancelable: false, onConfirm: onClose})

    const onConfirm = id => async () => {
        try {
            const url = process.env.NEXT_PUBLIC_API_URL + '/lab/' + id
            console.log(url)
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            })
            const data = await response.json()

            if (response.status !== 200) {
                onOpen()
                setAlertData({ title: 'Error', message: data.message })
            } else {
                onOpen()
                setAlertData({ title: 'Success', message: 'Data deleted successfully' })
                setData(data => data.filter(lab => lab.id !== id))
            }
        } catch (error) {
            console.log(error)
            onOpen()
            setAlertData({ title: 'Error', message: 'Client Error' })
        }
    }

    const onDelete = id => () => {
        setAlertData({ title : 'Delete Confirmation', message: 'Are u sure u wanna delete this data ?', isDangerous: true, cancelable: true, onConfirm: onConfirm(id)})
        onOpen()
    }

    React.useEffect(() => {

        const fetchData = async () => {
            try {
                const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/labs')
                const data = await response.json()
                console.log(data)
                const {labs} = data.data
                
                setData(labs)
            } catch (error) {
                onOpen()
                setAlertData({ title: 'Error', message: 'Client Error' })
            }
        }

        fetchData()

    }, [])

    return (
        <Flex direction='column' gap='32px'>
            <Flex gap='16px'>
                <Button colorScheme='blue' padding='16px' onClick={onMenuOpen}><HamburgerIcon /></Button>
                <Heading as='h1' size='xl'>Daftar Laboratorium</Heading>
            </Flex>
            <TableContainer>
                <Table variant='simple'>
                    <Thead>
                        <Tr>
                            <Th>Nama</Th>
                            <Th>Alias</Th>
                            <Th>Website</Th>
                            <Th>Aksi</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {data === null && <Tr><Td>Loading...</Td></Tr>}
                        {data !== null && data.length === 0 && <Tr><Td>No data</Td></Tr>}
                        {data !== null && data.length > 0 && data.map((lab) => (
                            <Tr key={lab.id}>
                                <Td>{lab.name}</Td>
                                <Td>{lab.alias}</Td>
                                <Td><Link href={lab.website} isExternal>{lab.website}</Link></Td>
                                <Td>
                                    <Flex gap='16px'>
                                        <Button as={Link} href={`/admin/lab/${lab.id}`} colorScheme='blue'>Edit</Button>
                                        <Button colorScheme='red' onClick={onDelete(lab.id)}>Hapus</Button>
                                    </Flex>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>

            <Button as={Link} href='/admin/lab' colorScheme='green'>Tambah Laboratorium</Button>

            <AlertDialogContainer isOpen={isOpen} onClose={onClose} title={alertData.title} message={alertData.message} isDangerous={alertData.isDangerous} cancelable={alertData.cancelable} onConfirm={alertData.onConfirm}/>
        </Flex>
    )
}

export default Page