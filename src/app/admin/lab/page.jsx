'use client'

import React from 'react'
import {
    Button,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Heading,
    Input,
    Textarea,
    useDisclosure
} from "@chakra-ui/react"
import { Field, Form, Formik } from "formik"
import { useRouter } from 'next/navigation'
import { HamburgerIcon } from '@chakra-ui/icons'

import AlertDialogContainer from "components/ui/AlertDialogContainer"
import useAuthStore from 'store/useAuthStore'
import { SidebarContext } from 'context/SidebarContext'

const validate = values => {
    const errors = {}

    if (!values.name) errors.name = 'Name is required'

    if (!values.alias) errors.alias = 'Alias is required'

    if (!values.general_information) errors.general_information = 'General information is required'

    return errors
}

const Page = () => {
    const router = useRouter()

    const token = useAuthStore.useToken()

    const { onOpen: onMenuOpen } = React.useContext(SidebarContext)

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ alertData, setAlertData ] = React.useState({ title: '', message: ''})

    const onSubmit = async (values) => {
        try {
            const url = process.env.NEXT_PUBLIC_API_URL + '/lab'
    
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
            })
    
            const data = await response.json()
    
            if (response.status !== 201) {
                onOpen()
                setAlertData({ title: 'Error', message: data.message })
            } else {
                router.push('/admin/laboratories')
            }
        } catch (error) {
            onOpen()
            setAlertData({ title: 'Error', message: 'Error Client' })
        }
    }

    return (
        <Flex direction='column' gap='32px'>
            <Flex gap='16px'>
                <Button colorScheme='blue' padding='16px' onClick={onMenuOpen}><HamburgerIcon /></Button>
                <Heading as='h1' size='xl'>Laboratorium Baru</Heading>
            </Flex>
            <Formik
                initialValues={{ name: '', alias: '', website: '', general_information: '' }}
                onSubmit={onSubmit}
                validate={validate}
            >
                {({ handleSubmit, errors, touched }) => (
                    <Form onSubmit={handleSubmit}>
                        <Flex direction='column' gap='16px'>
                            <FormControl isInvalid={touched.name && errors.name} isRequired>
                                <FormLabel>Nama</FormLabel>
                                <Field as={Input} name='name' placeholder='Nama'/>
                                <FormErrorMessage>{errors.name}</FormErrorMessage>
                            </FormControl>
                            
                            <FormControl isInvalid={touched.alias && errors.alias} isRequired>
                                <FormLabel>Alias</FormLabel>
                                <Field as={Input} name='alias' placeholder='Alias'/>
                                <FormErrorMessage>{errors.alias}</FormErrorMessage>
                            </FormControl>

                            <FormControl isInvalid={touched.website && errors.website}>
                                <FormLabel>Website</FormLabel>
                                <Field as={Input} name='website' placeholder='Website'/>
                                <FormErrorMessage>{errors.website}</FormErrorMessage>
                            </FormControl>
                            <FormControl isInvalid={touched.general_information && errors.general_information} isRequired>
                                <FormLabel>Informasi Umum</FormLabel>
                                <Field as={Textarea} name='general_information' placeholder='Informasi Umum'/>
                                <FormErrorMessage>{errors.general_information}</FormErrorMessage>
                            </FormControl>
                            <Button type='submit' colorScheme='green'>Simpan</Button>
                        </Flex>
                    </Form>
                )}
                
            </Formik>
            <AlertDialogContainer isOpen={isOpen} onClose={onClose} title={alertData.title} message={alertData.message} />
        </Flex>
    )
}

export default Page