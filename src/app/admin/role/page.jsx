'use client'

import React from 'react'
import { Button, Flex, FormControl, FormErrorMessage, FormLabel, Heading, Input, useDisclosure } from "@chakra-ui/react"
import { useRouter } from 'next/navigation'
import { HamburgerIcon } from '@chakra-ui/icons'
import { Field, Form, Formik } from "formik"

import AlertDialogContainer from "components/ui/AlertDialogContainer"
import useAuthStore from 'store/useAuthStore'
import { SidebarContext } from 'context/SidebarContext'

const validate = values => {
    const errors = {}

    if (!values.name) errors.name = 'Name is required'

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
            const url = process.env.NEXT_PUBLIC_API_URL + '/role'
    
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
            }
            
            if (response.status === 201 && data.data.role) {
                router.push('/admin/roles')
            }
        } catch (error) {
            onOpen()
            setAlertData({ title: 'Error', message: 'Client Error' })
        }
    }

    return (
        <Flex direction='column' gap='32px'>
            <Flex gap='16px'>
                <Button colorScheme='blue' padding='16px' onClick={onMenuOpen}><HamburgerIcon /></Button>
                <Heading as='h1' size='xl'>Role Baru</Heading>
            </Flex>
            <Formik
                initialValues={{ name: '' }}
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