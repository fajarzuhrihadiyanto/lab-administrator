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
    Image,
    Input,
    useDisclosure
} from "@chakra-ui/react"
import { Field, FieldArray, Form, Formik } from "formik"
import { useRouter } from "next/navigation"

import AlertDialogContainer from "components/ui/AlertDialogContainer"
import { SidebarContext } from "context/SidebarContext"
import useAuthStore from "store/useAuthStore"
import getBase64 from "utils/getBase64"

const validate = values => {
    const errors = {}

    if (!values.fullname) errors.fullname = 'Required'
    if (!values.initial) errors.initial = 'Required'
    if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) errors.email = 'Invalid email address'
    if (!values.latest_education) errors.latest_education = 'Required'
    if (!values.position || values.position.length === 0) errors.position = 'Required minimum one position'

    return errors
}

const Page = ({ params }) => {
    const { lab_id, professor_id } = params
    
    const router = useRouter()

    const token = useAuthStore.useToken()

    const { onOpen: onMenuOpen } = React.useContext(SidebarContext)

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ alertData, setAlertData ] = React.useState({ title: '', message: '', isDangerous: false, cancelable: false, onConfirm: onClose})

    const [ data, setData ] = React.useState(null)
    const [ labData, setLabData ] = React.useState(null)
    const [ photo, setPhoto ] = React.useState('')

    const onSubmit = async values => {
        try {
            console.log(values)
            const body = {...values, lab_id}

            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/professor/' + professor_id, {
                method: 'PUT',
                headers: {
                    Authorization: `bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            const data = await response.json()

            console.log(data)
            if (response.status !== 200) {
                onOpen()
                setAlertData({ title: 'Error', message: data.message })
            } else {
                router.push('/admin/lab/' + lab_id + '/professors')
            }

        } catch (error) {
            onOpen()
            setAlertData({ title: 'Error', message: 'Client Error' })
        }
    }

    const onFileInput = setFieldValue => async e => {
        if (e.target.files[0]) {
            const base64 = await getBase64(e.target.files[0])
            setPhoto(base64)
            setFieldValue('photo', base64)
        }
    }

    const resetPhoto = setFieldValue => () => {
        setPhoto(data.photo_url)
        setFieldValue('photo', '')
        setFieldValue('photo_raw', '')
    }

    React.useEffect(() => {
        try {
            const fetchData = async () => {
                const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/professor/' + professor_id)

                const data = await response.json()

                setData(data.data.professor)
                setPhoto(data.data.professor.photo_url)
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
            {labData === null || data === null ? <Heading as='h1' size='xl'>Loading</Heading>
            : <>
                <Flex gap='16px'>
                    <Button colorScheme='blue' padding='16px' onClick={onMenuOpen}><HamburgerIcon /></Button>
                    <Box>
                        <Heading as='h1' size='xl'>Laboratorium {labData.name}</Heading>
                        <Heading as='h2' size='md'>{data.fullname}</Heading>
                    </Box>
                </Flex>

                <Formik
                    initialValues={{
                        fullname: data.fullname,
                        initial: data.initial,
                        email: data.email,
                        NIDN: data.NIDN,
                        latest_education: data.latest_education,
                        is_head_lab: !!data.is_head_lab,
                        photo: '',
                        photo_raw: '',
                        position: data.position,
                        publication: {
                            scopus_id: data.publication.scopus_id,
                            google_scholar_id: data.publication.google_scholar_id,
                            sinta_id: data.publication.sinta_id
                        }
                    }}
                    validate={validate}
                    onSubmit={onSubmit}
                >
                    {({ handleSubmit, values, errors, touched, setFieldValue,  }) => (
                        <Form onSubmit={handleSubmit}>
                            <Flex direction='column' gap='16px'>
                                <Flex direction='column' gap='16px'>
                                    <Heading as='h2' size='md' fontWeight='semibold'>Informasi Umum</Heading>
                                    <FormControl isInvalid={errors.fullname && touched.fullname}>
                                        <Field as={Input} name='fullname' placeholder='Nama dosen'/>
                                        <FormErrorMessage>{errors.fullname}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl isInvalid={errors.initial && touched.initial}>
                                        <Field as={Input} name='initial' placeholder='Inisial'/>
                                        <FormErrorMessage>{errors.initial}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl isInvalid={errors.email && touched.email}>
                                        <Field as={Input} name='email' placeholder='Email'/>
                                        <FormErrorMessage>{errors.email}</FormErrorMessage>
                                    </FormControl>
                                    <Field as={Input} name='NIDN' placeholder='NIDN'/>
                                    <FormControl isInvalid={errors.latest_education && touched.latest_education}>
                                        <Field as={Input} name='latest_education' placeholder='Pendidikan terakhir'/>
                                        <FormErrorMessage>{errors.latest_education}</FormErrorMessage>
                                    </FormControl>
                                    <Field as={Checkbox} name='is_head_lab' defaultChecked={values.is_head_lab}>Kepala laboratorium</Field>
                                </Flex>

                                <Flex direction='column' gap='16px'>
                                    <Heading as='h2' size='md' fontWeight='semibold'>Foto</Heading>
                                    <Field as={Input} name='photo' type='hidden'/>
                                    <Flex gap='16px'>
                                        <Image src={photo} alt='Photo' boxSize='100px' objectFit='cover'/>
                                        <Field as={Input} name='photo_raw' accept='image/*' type="file" onInput={onFileInput(setFieldValue)} onCancel={e => console.log(e)}/>
                                        <Button onClick={resetPhoto(setFieldValue)}>Reset</Button>
                                    </Flex>
                                </Flex>

                                <FieldArray
                                    name='position' 
                                    render={arrayHelpers => (
                                        <FormControl isInvalid={errors.position && touched.position}>
                                            <Flex direction='column' gap='16px'>
                                                <Heading as='h2' size='md' fontWeight='semibold'>Jabatan Terakhir</Heading>
                                                {values.position.map((_, index) =>
                                                    <Flex gap='16px' key={index}>
                                                        <Field as={Input} name={`position.${index}.name`} placeholder='Nama jabatan'/>
                                                        <Flex gap='16px'>
                                                            <Field as={Input} name={`position.${index}.from_year`} placeholder='Tahun mulai'/>
                                                            <Field as={Input} name={`position.${index}.to_year`} placeholder='Tahun selesai'/>
                                                        </Flex>
                                                        <Button colorScheme='red' onClick={() => arrayHelpers.remove(index)}>Hapus</Button>
                                                    </Flex>
                                                )}
                                                <Button onClick={() => arrayHelpers.push('')}>Tambah jabatan</Button>
                                            </Flex>
                                            <FormErrorMessage>{errors.position}</FormErrorMessage>
                                        </FormControl>
                                    )}
                                    />

                                <Flex direction='column' gap='16px'>
                                    <Heading as='h2' size='md' fontWeight='semibold'>Publikasi</Heading>
                                    <Field as={Input} name='publication.scopus_id' placeholder='ID Scopus'/>
                                    <Field as={Input} name='publication.google_scholar_id' placeholder='ID Google Scholar'/>
                                    <Field as={Input} name='publication.sinta_id' placeholder='ID Sinta'/>
                                </Flex>

                                <Button type='submit' colorScheme='green'>Simpan</Button>
                            </Flex>
                        </Form>
                    )}
                </Formik>
            </>}

            <AlertDialogContainer isOpen={isOpen} onClose={onClose} title={alertData.title} message={alertData.message} />
        </Flex>
    )
}

export default Page