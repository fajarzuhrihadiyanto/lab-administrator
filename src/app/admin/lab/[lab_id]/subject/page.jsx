'use client'

import React from "react"
import { HamburgerIcon } from "@chakra-ui/icons"
import {
    Box,
    Button,
    Checkbox,
    Flex,
    FormControl,
    FormErrorMessage,
    Heading,
    Input,
    Textarea,
    useDisclosure 
} from "@chakra-ui/react"
import { Field, FieldArray, Form, Formik } from "formik"
import { useRouter } from "next/navigation"

import AlertDialogContainer from "components/ui/AlertDialogContainer"
import { SidebarContext } from "context/SidebarContext"
import useAuthStore from "store/useAuthStore"

const validate = values => {
    const errors = {}

    if (!values.name) errors.name = 'Required'
    if (!values.description) errors.description = 'Required'
    if (!values.objective || values.objective.length === 0) errors.objective = 'Required minimum one objective'
    else {
        values.objective.forEach((objective) => {
            if (!objective) errors.objective = `Objective cannot be empty`
        })
    }

    return errors
}

const Page = ({ params }) => {
    const { lab_id } = params
    
    const router = useRouter()

    const token = useAuthStore.useToken()

    const { onOpen: onMenuOpen } = React.useContext(SidebarContext)

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ alertData, setAlertData ] = React.useState({ title: '', message: '', isDangerous: false, cancelable: false, onConfirm: onClose})

    const [ labData, setLabData ] = React.useState(null)

    const onSubmit = async values => {
        try {
            const body = {...values, lab_id}

            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/subject', {
                method: 'POST',
                headers: {
                    Authorization: `bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            const data = await response.json()

            if (response.status !== 201) {
                onOpen()
                setAlertData({ title: 'Error', message: data.message })
            } else {
                router.push('/admin/lab/' + lab_id + '/subjects')
            }

        } catch (error) {
            onOpen()
            setAlertData({ title: 'Error', message: 'Client Error' })
        }
    }

    React.useEffect(() => {
        try {
            const fetchLabData = async () => {
                const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/lab/' + lab_id)

                const data = await response.json()

                setLabData(data.data.lab)
            }

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
                    <Heading as='h2' size='md'>Mata Kuliah Baru</Heading>
                </Box>
            </Flex>

                <Formik
                    initialValues={{
                        name: '',
                        description: '',
                        is_compulsory: false,
                        objective: []
                    }}
                    validate={validate}
                    onSubmit={onSubmit}
                >
                    {({ handleSubmit, errors, touched, values }) => (
                        <Form onSubmit={handleSubmit}>
                            <Flex direction='column' gap='16px'>
                                <FormControl isInvalid={errors.name && touched.name}>
                                    <Field as={Input} name='name' placeholder='Nama Mata Kuliah'/>
                                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                                </FormControl>
                                <FormControl isInvalid={errors.description && touched.description}>
                                    <Field as={Textarea} name='description' placeholder='Deskripsi Mata Kuliah'/>
                                    <FormErrorMessage>{errors.description}</FormErrorMessage>
                                </FormControl>
                                <Field as={Checkbox} name='is_compulsory'>Mata kuliah wajib</Field>
                                <Heading as='h3' size='md' flex='1' fontWeight='semibold' textAlign='left'>
                                    Capaian Mata Kuliah
                                </Heading>
                                <FieldArray name='objective'
                                    render={arrayHelpers => (
                                        <FormControl isInvalid={errors.objective && touched.objective}>
                                            <Flex direction='column' gap='16px'>
                                                {values.objective.map((_, index) =>
                                                    <Flex gap='16px' key={index}>
                                                        <Field key={index} as={Input} name={`objective.${index}`} placeholder='Poin capaian mata kuliah'/>
                                                        <Button colorScheme='red' onClick={() => arrayHelpers.remove(index)}>Hapus</Button>
                                                    </Flex>
                                                )}
                                                <Button onClick={() => arrayHelpers.push('')}>Tambah poin capaian mata kuliah</Button>
                                            </Flex>
                                            <FormErrorMessage>{errors.objective}</FormErrorMessage>
                                        </FormControl>
                                    )}
                                />
                                <Button type='submit' colorScheme='green'>Simpan</Button>
                            </Flex>
                        </Form>
                    )}
                </Formik>
            </>
            }
            <AlertDialogContainer isOpen={isOpen} onClose={onClose} title={alertData.title} message={alertData.message} />
        </Flex>
    )
}

export default Page