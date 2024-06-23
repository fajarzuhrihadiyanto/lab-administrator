'use client'

import React from "react"
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    Flex,
    FormControl,
    FormErrorMessage,
    Heading,
    Input,
    useDisclosure
} from "@chakra-ui/react"
import { Field, Form, Formik } from "formik"
import { useRouter } from 'next/navigation'

import AlertDialogContainer from "components/ui/AlertDialogContainer"
import useAuthStore from "store/useAuthStore"
import isAuth from "utils/isAuth"

const validate = (values) => {
    const errors = {}

    if (!values.username) errors.username = 'Username is required'

    if (!values.password) errors.password = 'Password is required'
    else if (values.password.length < 8) errors.password = 'Password must be at least 8 characters long'

    return errors
}

const Page = () => {
    const router = useRouter()
    const { isOpen, onOpen, onClose } = useDisclosure()

    const login = useAuthStore.useLogin()

    const [ alertData, setAlertData ] = React.useState({ title: '', message: ''})

    const onSubmit = async (values) => {
        try {
            const url = process.env.NEXT_PUBLIC_API_URL + '/auth/login'
    
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
            })
    
            const data = await response.json()
    
            if (response.status !== 200) {
                onOpen()
                setAlertData({ title: 'Error', message: data.message })
            } else {
                const { user, token } = data.data
                login({ user, token })
                router.push('/admin')
            }
        } catch (error) {
            onOpen()
            setAlertData({ title: 'Error', message: 'Client error' })
        }
    }

    return (
        <Flex width='100vw' height='100vh' alignItems='center' justifyContent='center'>
            <Flex direction='column' gap='16px' width='50%' minWidth='300px' maxWidth='500px' >
                <Heading as='h1' size='lg' textAlign='center'>Login</Heading>
                <Formik
                    initialValues={{ username: '', password: '' }}
                    onSubmit={onSubmit}
                    validate={validate}
                >
                    {({ handleSubmit, errors, touched }) => (
                        <Form onSubmit={handleSubmit}>
                            <Flex direction='column' gap='16px'>
                                <FormControl isInvalid={touched.username && errors.username}>
                                    <Field as={Input} name='username' placeholder='Username'/>
                                    <FormErrorMessage>{errors.username}</FormErrorMessage>
                                </FormControl>
                                <FormControl isInvalid={touched.password && errors.password}>
                                    <Field as={Input} name='password' placeholder='Password' type='password' />
                                    <FormErrorMessage>{errors.password}</FormErrorMessage>
                                </FormControl>
            
                                <Button type="submit" colorScheme='blue' width='100%'>Login</Button>
                            </Flex>
                        </Form>
                    )}
                </Formik>
            </Flex>

            <AlertDialogContainer isOpen={isOpen} onClose={onClose} title={alertData.title} message={alertData.message} />
        </Flex>
    )
}

export default isAuth(Page)