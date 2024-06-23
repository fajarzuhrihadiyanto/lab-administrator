'use client'

import React from 'react'

import { Button, Flex, FormControl, FormErrorMessage, FormLabel, Heading, Input, Textarea, useDisclosure } from "@chakra-ui/react"
import AlertDialogContainer from "components/ui/AlertDialogContainer"
import { Field, Form, Formik } from "formik"
import useAuthStore from 'src/store/useAuthStore'
import { useRouter } from 'next/navigation'
import { SidebarContext } from 'src/context/SidebarContext'
import { HamburgerIcon } from '@chakra-ui/icons'

const Page = ({params}) => {
    const { onOpen: onMenuOpen } = React.useContext(SidebarContext)
    const {lab_id} = params
    const [alertData, setAlertData] = React.useState({ title: '', message: ''})
    const [ data, setData ] = React.useState(null)
    const { isOpen, onOpen, onClose } = useDisclosure()

    const token = useAuthStore.useToken()
    const router = useRouter()

    React.useEffect(() => {
        try {
            const url = process.env.NEXT_PUBLIC_API_URL + '/lab/' + lab_id
            
            const fetchData = async () => {
                const response = await fetch(url)

                const data = await response.json()
                console.log(data)

                setData(data.data.lab)
            }

            fetchData()
        } catch (error) {
            onOpen()
            setAlertData({ title: 'Error', message: 'Client Error' })
        }
    }, [])

    const onSubmit = async (values) => {
        try {
            const url = process.env.NEXT_PUBLIC_API_URL + '/lab/' + lab_id
    
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
            })
    
            const data = await response.json()
    
            if (response.status !== 200) {
                onOpen()
                setAlertData({ title: 'Error', message: data.message })
            }
            console.log(response.status)
            console.log(data)
            if (response.status === 200) {
                console.log('got here')
                router.push('/admin/laboratories')
            }
        } catch (error) {
            onOpen()
            setAlertData({ title: 'Error', message: 'Client Error' })
        }
    }

    const validate = values => {
        const errors = {}
        if (!values.name) {
            errors.name = 'Name is required'
        }

        if (!values.alias) {
            errors.alias = 'Alias is required'
        }

        if (!values.general_information) {
            errors.general_information = 'General information is required'
        }

        return errors
    }
    return (
        <Flex direction='column' gap='32px'>
            {data === null ? <Heading as='h1' size='xl'>Loading</Heading>
            : <>
                <Flex gap='16px'>
                    <Button colorScheme='blue' padding='16px' onClick={onMenuOpen}><HamburgerIcon /></Button>
                    <Heading as='h1' size='xl'>Laboratorium {data.name}</Heading>
                </Flex>
                <Formik
                    initialValues={{ name: data.name, alias: data.alias, website: data.website, general_information: data.general_information }}
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
            </> }
        </Flex>
    )
}

export default Page