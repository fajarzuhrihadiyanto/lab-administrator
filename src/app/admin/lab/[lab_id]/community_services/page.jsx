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
    Select,
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

    if (!values.title) errors.title = 'Required'
    if (!values.year) errors.year = 'Required'

    return errors
}

const NewCommunityServiceRow = ({ lab_id, professors, setCommunityServices, setIsEdit, onOpen, setAlertData }) => {
    const token = useAuthStore.useToken()

    const onSubmit = async (values, { resetForm }) => {
        try {
            const url = process.env.NEXT_PUBLIC_API_URL + '/community_service'

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
                setCommunityServices(cs => [...cs, data.data.community_service])
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
                    lab_id,
                    community_service_type: '',
                    title: '',
                    year: new Date().getFullYear(),
                    professor_id: ''

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
                            <Field as={Input} name='community_service_type' form='form-new' placeholder='Jenis pengabdian masyarakat' />
                        </Td>
                        <Td>
                            <FormControl isInvalid={errors.title && touched.title}>
                                <Field as={Input} name='title' form='form-new' placeholder='Judul' />
                                <FormErrorMessage>{errors.title}</FormErrorMessage>
                            </FormControl>
                        </Td>
                        <Td>
                            <FormControl isInvalid={errors.year && touched.year}>
                                <Field as={Input} type='number' name='year' form='form-new' placeholder='Tahun' />
                                <FormErrorMessage>{errors.year}</FormErrorMessage>
                            </FormControl>
                        </Td>
                        <Td>
                            <Field as={Select} name='professor_id' form='form-new' placeholder='Pilih dosen'>
                                {professors.map(professor => <option value={professor.id}>{professor.fullname}</option>)}
                            </Field>
                        </Td>
                        <Td>
                            <Flex gap='16px'>
                                <Button colorScheme='green' type='submit' form='form-new'>Tambah</Button>
                            </Flex>
                        </Td>
                    </>
                )}
            </Formik>
        </Tr>
)}

const Page = ({ params }) => {
    const { lab_id } = params

    const token = useAuthStore.useToken()

    const { onOpen: onMenuOpen } = React.useContext(SidebarContext)

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ alertData, setAlertData ] = React.useState({ title: '', message: '', isDangerous: false, cancelable: false, onConfirm: onClose})

    const [ communityServices, setCommunityServices ] = React.useState(null)
    const [ labData, setLabData ] = React.useState(null)
    const [ professorData, setProfessorData ] = React.useState(null)
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
            const url = process.env.NEXT_PUBLIC_API_URL + '/community_service/' + id

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
                setCommunityServices(data => data.map(cs => cs.id === id ? {...cs, ...values} : cs))
            }
        } catch (error) { 
            onOpen()
            setAlertData({ title: 'Error', message: 'Client Error' })
        }
    }

    const onConfirm = id => async () => {
        try {
            const url = process.env.NEXT_PUBLIC_API_URL + '/community_service/' + id
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
                setCommunityServices(data => data.filter(lab => lab.id !== id))
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
                const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/community_services?lab_id=' + lab_id)

                const data = await response.json()

                setCommunityServices(data.data.community_services)
                setIsEdit(data.data.community_services.map(() => false))
            }

            const fetchLabData = async () => {
                const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/lab/' + lab_id)

                const data = await response.json()

                setLabData(data.data.lab)
            }

            const fetchProfessorData = async () => {
                const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/professors?lab_id=' + lab_id)

                const data = await response.json()

                setProfessorData(data.data.professors)
            }

            fetchData()
            fetchLabData()
            fetchProfessorData()
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
                    <Heading as='h2' size='md'>Daftar Pengabdian Masyarakat</Heading>
                </Box>
            </Flex>

            <TableContainer>
                <Table variant='simple'>
                    <Thead>
                        <Tr>
                            <Th>Jenis Pengabdian Masyarakat</Th>
                            <Th>Judul</Th>
                            <Th width='150px'>Tahun</Th>
                            <Th>Dosen Penanggung Jawab</Th>
                            <Th width='100px'>Aksi</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {(communityServices === null || professorData === null) && <Tr><Td>Loading...</Td></Tr>}
                        {communityServices !== null && communityServices.length === 0 && <Tr><Td>No data</Td></Tr>}
                        {communityServices !== null && professorData !== null && communityServices.length > 0 && communityServices.map((cs, index) =>
                            <Tr key={index}>
                                <Formik
                                    initialValues={{
                                        community_service_type: cs.community_service_type,
                                        title: cs.title,
                                        year: cs.year,
                                        professor_id: cs.professor_id || ''
                                    }}
                                    enableReinitialize
                                    validate={validate}
                                    onSubmit={onSubmit(cs.id)}
                                >
                                    {({ handleSubmit, errors, touched }) => (
                                        <>
                                            <Td>
                                                <Form onSubmit={handleSubmit} id={`form-${index}`}/>
                                                <Field as={Input} name='community_service_type' isReadOnly={!isEdit[index]} form={`form-${index}`} placeholder='Jenis pengabdian masyarakat' />
                                            </Td>
                                            <Td>
                                                <FormControl isInvalid={errors.title && touched.title}>
                                                    <Field as={Input} name='title' isReadOnly={!isEdit[index]} form={`form-${index}`} placeholder='Judul' />
                                                    <FormErrorMessage>{errors.title}</FormErrorMessage>
                                                </FormControl>
                                            </Td>
                                            <Td>
                                                <FormControl isInvalid={errors.year && touched.year}>
                                                    <Field as={Input} type='number' name='year' isReadOnly={!isEdit[index]} form={`form-${index}`} placeholder='Tahun' />
                                                    <FormErrorMessage>{errors.year}</FormErrorMessage>
                                                </FormControl>
                                            </Td>
                                            <Td>
                                                <Field as={Select} name='professor_id' disabled={!isEdit[index]} form={`form-${index}`} placeholder='Pilih Dosen'>
                                                    {professorData.map(professor => <option value={professor.id}>{professor.fullname}</option>)}
                                                </Field>
                                            </Td>
                                            <Td>
                                                <Flex gap='16px'>
                                                {isEdit[index]
                                                ? <>
                                                    <Button type='submit' colorScheme='green' form={`form-${index}`}>Simpan</Button> 
                                                    <Button colorScheme='blue' onClick={cancelEdit(index)}>Kembali</Button>
                                                    </>
                                                : <Button colorScheme='blue' onClick={goToEdit(index)}>Edit</Button>}
                                                    <Button colorScheme='red' onClick={onDelete(cs.id)}>Hapus</Button>
                                                </Flex>
                                            </Td>
                                        </>
                                    )}
                                </Formik>
                            </Tr>
                        )}
                        {professorData !== null && <NewCommunityServiceRow lab_id={lab_id} onOpen={onOpen} professors={professorData} setAlertData={setAlertData} setCommunityServices={setCommunityServices} setIsEdit={setIsEdit}/>}
                    </Tbody>
                </Table>
            </TableContainer>
            </>}

            <AlertDialogContainer isOpen={isOpen} onClose={onClose} title={alertData.title} message={alertData.message} isDangerous={alertData.isDangerous} cancelable={alertData.cancelable} onConfirm={alertData.onConfirm} />
        </Flex>
    )
}

export default Page