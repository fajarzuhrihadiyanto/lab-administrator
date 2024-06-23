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
    if (!values.release_year) errors.release_year = 'Required'
    if (!values.professor_id) errors.professor_id = 'Required'

    return errors
}

const NewBookRow = ({ lab_id, professors, setBooks, setIsEdit, onOpen, setAlertData }) => {
    const token = useAuthStore.useToken()

    const onSubmit = async (values, { resetForm }) => {
        try {
            const url = process.env.NEXT_PUBLIC_API_URL + '/book'

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
                setBooks(books => [...books, data.data.book])
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
                    ISBN: '',
                    title: '',
                    release_year: new Date().getFullYear(),
                    release_city: '',
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
                            <Field as={Input} name='ISBN' form='form-new' placeholder='ISBN' />
                        </Td>
                        <Td>
                            <FormControl isInvalid={errors.title && touched.title}>
                                <Field as={Input} name='title' form='form-new' placeholder='Judul' />
                                <FormErrorMessage>{errors.title}</FormErrorMessage>
                            </FormControl>
                        </Td>
                        <Td>
                            <FormControl isInvalid={errors.release_year && touched.release_year}>
                                <Field as={Input} type='number' name='release_year' form='form-new' placeholder='Tahun rilis' />
                                <FormErrorMessage>{errors.release_year}</FormErrorMessage>
                            </FormControl>
                        </Td>
                        <Td>
                            <Field as={Input} name='release_city' form='form-new' placeholder='Kota rilis' />
                        </Td>
                        <Td>
                            <FormControl isInvalid={errors.professor_id && touched.professor_id}>
                                <Field as={Select} name='professor_id' form='form-new' placeholder='Pilih Dosen'>
                                    {professors.map(professor => <option value={professor.id}>{professor.fullname}</option>)}
                                </Field>
                                <FormErrorMessage>{errors.professor_id}</FormErrorMessage>
                            </FormControl>
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

    const [ books, setBooks ] = React.useState(null)
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
            const url = process.env.NEXT_PUBLIC_API_URL + '/book/' + id

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
                setBooks(data => data.map(book => book.id === id ? {...book, ...values} : book))
            }
        } catch (error) { 
            onOpen()
            setAlertData({ title: 'Error', message: 'Client Error' })
        }
    }

    const onConfirm = id => async () => {
        try {
            const url = process.env.NEXT_PUBLIC_API_URL + '/book/' + id
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
                setBooks(data => data.filter(book => book.id !== id))
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
                const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/books?lab_id=' + lab_id)

                const data = await response.json()

                setBooks(data.data.books)
                setIsEdit(data.data.books.map(() => false))
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
                    <Heading as='h2' size='md'>Daftar Buku</Heading>
                </Box>
            </Flex>

            <TableContainer>
                <Table variant='simple'>
                    <Thead>
                        <Tr>
                            <Th>ISBN</Th>
                            <Th>Judul</Th>
                            <Th width='150px'>Tahun Rilis</Th>
                            <Th>Kota Rilis</Th>
                            <Th>Pemilik</Th>
                            <Th width='100px'>Aksi</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {(books === null || professorData === null) && <Tr><Td>Loading...</Td></Tr>}
                        {books !== null && books.length === 0 && <Tr><Td>No data</Td></Tr>}
                        {books !== null && professorData !== null && books.length > 0 && books.map((book, index) =>
                            <Tr key={index}>
                                <Formik
                                    initialValues={{
                                        ISBN: book.ISBN || '',
                                        title: book.title,
                                        release_year: book.release_year,
                                        release_city: book.release_city || '',
                                        professor_id: book.professor_id || ''
                                    }}
                                    enableReinitialize
                                    validate={validate}
                                    onSubmit={onSubmit(book.id)}
                                >
                                    {({ handleSubmit, errors, touched }) => (
                                        <>
                                            <Td>
                                                <Form onSubmit={handleSubmit} id={`form-${index}`}/>
                                                <Field as={Input} name='ISBN' isReadOnly={!isEdit[index]} form={`form-${index}`} placeholder='ISBN' />
                                            </Td>
                                            <Td>
                                                <FormControl isInvalid={errors.title && touched.title}>
                                                    <Field as={Input} name='title' isReadOnly={!isEdit[index]} form={`form-${index}`} placeholder='Judul' />
                                                    <FormErrorMessage>{errors.title}</FormErrorMessage>
                                                </FormControl>
                                            </Td>
                                            <Td>
                                                <FormControl isInvalid={errors.release_year && touched.release_year}>
                                                    <Field as={Input} type='number' name='release_year' isReadOnly={!isEdit[index]} form={`form-${index}`} placeholder='Tahun rilis' />
                                                    <FormErrorMessage>{errors.release_year}</FormErrorMessage>
                                                </FormControl>
                                            </Td>
                                            <Td>
                                                <Field as={Input} name='release_city' isReadOnly={!isEdit[index]} form={`form-${index}`} placeholder='Kota rilis' />
                                            </Td>
                                            <Td>
                                                <FormControl isInvalid={errors.professor_id}>
                                                    <Field as={Select} name='professor_id' disabled={!isEdit[index]} form={`form-${index}`} placeholder='Pilih dosen'>
                                                        {professorData.map(professor => <option value={professor.id}>{professor.fullname}</option>)}
                                                    </Field>
                                                    <FormErrorMessage>{errors.professor_id}</FormErrorMessage>
                                                </FormControl>
                                            </Td>
                                            <Td>
                                                <Flex gap='16px'>
                                                {isEdit[index]
                                                ? <>
                                                    <Button type='submit' colorScheme='green' form={`form-${index}`}>Simpan</Button> 
                                                    <Button colorScheme='blue' onClick={cancelEdit(index)}>Kembali</Button>
                                                    </>
                                                : <Button colorScheme='blue' onClick={goToEdit(index)}>Edit</Button>}
                                                    <Button colorScheme='red' onClick={onDelete(book.id)}>Hapus</Button>
                                                </Flex>
                                            </Td>
                                        </>
                                    )}
                                </Formik>
                            </Tr>
                        )}
                        {professorData !== null && <NewBookRow lab_id={lab_id} onOpen={onOpen} professors={professorData} setAlertData={setAlertData} setBooks={setBooks} setIsEdit={setIsEdit}/>}
                    </Tbody>
                </Table>
            </TableContainer>
            </>}

            <AlertDialogContainer isOpen={isOpen} onClose={onClose} title={alertData.title} message={alertData.message} isDangerous={alertData.isDangerous} cancelable={alertData.cancelable} onConfirm={alertData.onConfirm} />
        </Flex>
    )
}

export default Page