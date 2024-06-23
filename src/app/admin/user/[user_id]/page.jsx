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
    Select,
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

    if (!values.username) errors.username = 'Name is required'

    if (!values.fullname) errors.fullname = 'Full name is required'

    if (values.password) {
        if (values.password.length < 8) errors.password = 'Password must be at least 8 characters'
        if (values.password2 !== values.password) errors.password2 = 'Password does not match'
    }

    if (!values.role_id) errors.role_id = 'Role is required'

    return errors
}

const Page = ({ params }) => {
    const { user_id } = params
    
    const router = useRouter()

    const token = useAuthStore.useToken()

    const { onOpen: onMenuOpen } = React.useContext(SidebarContext)

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [ alertData, setAlertData ] = React.useState({ title: '', message: ''})

    const [ roles, setRoles ] = React.useState(null)
    const [ user, setUser ] = React.useState(null)

    const onSubmit = async (values) => {
        try {
            const body = { ...values }
            if (body.password === '') {
                delete body.password
                delete body.password2
            }

            const url = process.env.NEXT_PUBLIC_API_URL + '/user/' + user_id
    
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })
    
            const data = await response.json()
    
            if (response.status !== 200) {
                onOpen()
                setAlertData({ title: 'Error', message: data.message })
            } else {
                router.push('/admin/users')
            }
        } catch (error) {
            onOpen()
            setAlertData({ title: 'Error', message: 'Client Error' })
        }
    }

    React.useEffect(() => {
        try {
            const fetchRoles = async () => {
                try {
                    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/roles', {
                        headers: {
                            Authorization: `bearer ${token}`
                        }
                    })

                    const data = await response.json()

                    console.log(data)

                    setRoles(data.data.roles)
                } catch (error) {
                    onOpen()
                    setAlertData({ title: 'Error', message: 'Client Error' })
                }
            }

            const fetchUser = async () => {
                try {
                    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/user/' + user_id, {
                        headers: {
                            Authorization: `bearer ${token}`
                        }
                    })

                    const data = await response.json()
                    console.log(data)
    
                    setUser(data.data.user)
                } catch (error) {
                    onOpen()
                    setAlertData({ title: 'Error', message: 'Client Error' })
                }
            }

            fetchRoles()
            fetchUser()
        } catch (error) {
            onOpen()
            setAlertData({ title: 'Error', message: 'Client Error' })
        }
    }, [])
    return (
        <Flex direction='column' gap='32px'>
            {roles === null || user === null ? <Heading as='h1' size='xl'>Loading</Heading>
            : <>
                <Flex gap='16px'>
                    <Button colorScheme='blue' padding='16px' onClick={onMenuOpen}><HamburgerIcon /></Button>
                    <Heading as='h1' size='xl'>{user.fullname}</Heading>
                </Flex>
                <Formik
                    initialValues={{ username: user.username, fullname: user.fullname, password: '', password2: '', role_id: user.role_id }}
                    onSubmit={onSubmit}
                    validate={validate}
                >
                    {({ handleSubmit, errors, touched }) => (
                        <Form onSubmit={handleSubmit}>
                            <Flex direction='column' gap='16px'>
                                <FormControl isInvalid={touched.username && errors.username} isRequired>
                                    <FormLabel>Username</FormLabel>
                                    <Field as={Input} name='username' placeholder='Username'/>
                                    <FormErrorMessage>{errors.username}</FormErrorMessage>
                                </FormControl>
                                
                                <FormControl isInvalid={touched.fullname && errors.fullname} isRequired>
                                    <FormLabel>Nama</FormLabel>
                                    <Field as={Input} name='fullname' placeholder='Nama'/>
                                    <FormErrorMessage>{errors.fullname}</FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={touched.password && errors.password}>
                                    <FormLabel>Password</FormLabel>
                                    <Field as={Input} type='password' name='password' placeholder='Password'/>
                                    <FormErrorMessage>{errors.password}</FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={touched.password2 && errors.password2}>
                                    <FormLabel>Konfirmasi Password</FormLabel>
                                    <Field as={Input} type='password' name='password2' placeholder='Konfirmasi password'/>
                                    <FormErrorMessage>{errors.password2}</FormErrorMessage>
                                </FormControl>
                                <FormControl isInvalid={touched.role_id && errors.role_id} isRequired>
                                    <FormLabel>Role</FormLabel>

                                    <Field as={Select} name='role_id' placeholder='Pilih role'>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </Field>

                                    <FormErrorMessage>{errors.role_id}</FormErrorMessage>
                                </FormControl>
                                <Button type='submit' colorScheme='green'>Simpan</Button>
                            </Flex>
                        </Form>
                    )}
                    
                </Formik>
                <AlertDialogContainer isOpen={isOpen} onClose={onClose} title={alertData.title} message={alertData.message} />
            </> }
        </Flex>
    )
}

export default Page