'use client'

import React from "react"
import { HamburgerIcon } from "@chakra-ui/icons"
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormErrorMessage,
    Heading,
    Input,
    Table,
    TableContainer,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    useDisclosure
} from "@chakra-ui/react"
import { Field, Form, Formik } from "formik"

import AlertDialogContainer from "components/ui/AlertDialogContainer"
import { SidebarContext } from "context/SidebarContext"
import useAuthStore from "store/useAuthStore"

const validate = values => {
    const errors = {}

    if (!values.name) errors.name = 'Required'

    return errors
}

const NewFacilityRow = ({ lab_id, setFacilities, setIsEdit, onOpen, setAlertData }) => {
    const token = useAuthStore.useToken()

    const onSubmit = async (values, { resetForm }) => {
        try {
            const url = process.env.NEXT_PUBLIC_API_URL + '/facility'

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
            })

            const data = await response.json()

            if (response.status !== 201) {
                onOpen()
                setAlertData({ title: 'Error', message: data.message })
            } else {
                onOpen()
                setAlertData({ title: 'Success', message: 'Data added successfully' })
                setFacilities(facility => [...facility, data.data.facility])
                setIsEdit(isEdit => [...isEdit, false])
                resetForm()
            }
        } catch (error) {
            onOpen()
            setAlertData({ title: 'Error', message: 'Client Error' })
        }
    }
    return (
    <Tr>
        <Formik
            initialValues={{
                name: '',
                lab_id
            }}
            validate={validate}
            validateOnBlur={false}
            validateOnChange={false}
            onSubmit={onSubmit}
        >
            {({ handleSubmit, errors, touched }) => (
                <>
                    <Td>
                        <Form onSubmit={handleSubmit} id='form-new' />
                        <Field type='hidden' name='lab_id' form='form-new' />
                        <FormControl isInvalid={errors.name && touched.name}>
                            <Field as={Input} name='name' form='form-new' placeholder='Fasilitas' />
                            <FormErrorMessage>{errors.name}</FormErrorMessage>
                        </FormControl>
                    </Td>
                    <Td>
                        <Button type='submit' form='form-new' colorScheme='green'>Tambah</Button>
                    </Td>
                </>
            )}
        </Formik>
    </Tr>)}

const Page = ({ params }) => {
    const { lab_id } = params

    const token = useAuthStore.useToken()

    const { onOpen: onMenuOpen } = React.useContext(SidebarContext)

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ alertData, setAlertData ] = React.useState({ title: '', message: '', isDangerous: false, cancelable: false, onConfirm: onClose})

    const [ facilities, setFacilities ] = React.useState(null)
    const [ labData, setLabData ] = React.useState(null)
    const [ isEdit, setIsEdit ] = React.useState(null)

    const goToEdit = id => () => {
        setIsEdit(isEdit.map((_, index) => 
            index === id 
                ? true 
                : document.getElementById(`form-${index}`).reset() && false))
    }
    const cancelEdit = id => () => {
        document.getElementById(`form-${id}`).reset()
        setIsEdit(isEdit.map((_, index) => index === id ? false : _))
    }

    const onSubmit = id => async (values) => {
        try {
            const url = process.env.NEXT_PUBLIC_API_URL + '/facility/' + id

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    Authorization: `bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
            })

            const data = await response.json()

            if (response.status !== 200) {
                onOpen()
                setAlertData({ title: 'Error', message: data.message })
            } else {
                onOpen()
                setAlertData({ title: 'Success', message: 'Data updated successfully' })
                setIsEdit(isEdit => isEdit.map(() => false))
                setFacilities(data => data.map(facility => facility.id === id ? {...facility, ...values} : facility))
            }
        } catch (error) { 
            onOpen()
            setAlertData({ title: 'Error', message: 'Client Error' })
        }
    }

    const onConfirm = id => async () => {
        try {
            console.log('HALOO')
            const url = process.env.NEXT_PUBLIC_API_URL + '/facility/' + id
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
                setFacilities(data => data.filter(lab => lab.id !== id))
                setIsEdit(isEdit => isEdit.slice(0, -1))
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
                const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/facilities?lab_id=' + lab_id)

                const data = await response.json()

                setFacilities(data.data.facilities)
                setIsEdit(data.data.facilities.map(() => false))
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
                    <Heading as='h2' size='md'>Daftar Fasilitas</Heading>
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
                        {facilities === null && <Tr><Td>Loading...</Td></Tr>}
                        {facilities !== null && facilities.length === 0 && <Tr><Td>No data</Td></Tr>}
                        {facilities !== null && facilities.length > 0 && facilities.map((facility, index) =>
                            <Tr key={index}>
                                <Formik
                                    initialValues={{
                                        name: facility.name
                                    }}
                                    enableReinitialize
                                    validate={validate}
                                    onSubmit={onSubmit(facility.id)}
                                >
                                    {({ handleSubmit }) => (
                                    <>
                                    <Td>
                                        <Form id={`form-${index}`} onSubmit={handleSubmit} />
                                        <Field as={Input} name='name' isReadOnly={!isEdit[index]} form={`form-${index}`} />
                                    </Td>
                                    <Td>
                                        <Flex gap='16px'>
                                            {isEdit[index]
                                                ? <>
                                                    <Button type='submit' colorScheme='green' form={`form-${index}`}>Simpan</Button> 
                                                    <Button colorScheme='blue' onClick={cancelEdit(index)}>Kembali</Button>
                                                    </>
                                                : <Button colorScheme='blue' onClick={goToEdit(index)}>Edit</Button>}
                                            <Button colorScheme='red' onClick={onDelete(facility.id)}>Hapus</Button>
                                        </Flex>
                                    </Td>
                                    </>)}
                                </Formik>
                            </Tr>
                        )}
                        <NewFacilityRow lab_id={lab_id} setFacilities={setFacilities} setIsEdit={setIsEdit} onOpen={onOpen} setAlertData={setAlertData} />
                    </Tbody>
                </Table>
            </TableContainer>
            </>}

            <AlertDialogContainer isOpen={isOpen} onClose={onClose} title={alertData.title} message={alertData.message} isDangerous={alertData.isDangerous} cancelable={alertData.cancelable} onConfirm={alertData.onConfirm} />
        </Flex>
    )
}

export default Page