'use client'

import React from "react"
import { HamburgerIcon } from "@chakra-ui/icons"
import {
    Box,
    Button,
    Flex,
    Heading,
    Link,
    Table,
    TableContainer,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    useDisclosure
} from "@chakra-ui/react"

import AlertDialogContainer from "components/ui/AlertDialogContainer"
import { SidebarContext } from "context/SidebarContext"
import useAuthStore from "store/useAuthStore"

const Page = ({ params }) => {
    const { lab_id } = params

    const token = useAuthStore.useToken()

    const { onOpen: onMenuOpen } = React.useContext(SidebarContext)

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ alertData, setAlertData ] = React.useState({ title: '', message: '', isDangerous: false, cancelable: false, onConfirm: onClose})

    const [ subjects, setSubjects ] = React.useState(null)
    const [ labData, setLabData ] = React.useState(null)

    const onConfirm = id => async () => {
        try {
            const url = process.env.NEXT_PUBLIC_API_URL + '/subject/' + id
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
                setSubjects(data => data.filter(lab => lab.id !== id))
            }
        } catch (error) {
            onOpen()
            setAlertData({ title: 'Error', message: 'Client Error' })
        }
    }

    const onDelete = id => () => {
        setAlertData({ title : 'Delete Confirmation', message: 'Are u sure u wanna delete this data ?', isDangerous: true, cancelable: true, onConfirm: onConfirm(id)})
        onOpen()
    }
    
    React.useEffect(() => {
        try {
            const fetchData = async () => {
                const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/subjects?lab_id=' + lab_id)

                const data = await response.json()

                setSubjects(data.data.subjects)
            }

            const fetchLabData = async () => {
                const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/lab/' + lab_id)

                const data = await response.json()

                setLabData(data.data.lab)
            }

            fetchData()
            fetchLabData()
        } catch (error) {
            onOpen()
            setAlertData({ title: 'Error', message: 'Client Error' })
        }
    }, [])
    
    return (
        <Flex direction='column' gap='32px'>
            {labData === null ? <Heading as='h1' size='xl'>Loading</Heading>
            : <>
            <Flex gap='16px'>
                <Button colorScheme='blue' padding='16px' onClick={onMenuOpen}><HamburgerIcon /></Button>
                <Box>
                    <Heading as='h1' size='xl'>Laboratorium {labData.name}</Heading>
                    <Heading as='h2' size='md'>Daftar Mata Kuliah</Heading>
                </Box>
            </Flex>

            <TableContainer>
                <Table variant='simple'>
                    <Thead>
                        <Tr>
                            <Th>Nama</Th>
                            <Th width='100px'>Aksi</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {(subjects === null) && <Tr><Td>Loading...</Td></Tr>}
                        {subjects !== null && subjects.length === 0 && <Tr><Td>No data</Td></Tr>}
                        {subjects !== null && subjects.length > 0 && subjects.map((subject, index) =>
                            <Tr key={index}>
                                <Td>
                                    {subject.name}
                                </Td>
                                <Td>
                                    <Flex gap='16px'>
                                        <Button as={Link} href={`/admin/lab/${lab_id}/subject/${subject.id}`} colorScheme='blue'>Edit</Button>
                                        <Button colorScheme='red' onClick={onDelete(subject.id)}>Hapus</Button>
                                    </Flex>
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </TableContainer>
            </>}

            <Button as={Link} href={`/admin/lab/${lab_id}/subject/`} colorScheme='green'>Tambah Mata Kuliah</Button>

            <AlertDialogContainer isOpen={isOpen} onClose={onClose} title={alertData.title} message={alertData.message} isDangerous={alertData.isDangerous} cancelable={alertData.cancelable} onConfirm={alertData.onConfirm} />
        </Flex>
    )
}

export default Page