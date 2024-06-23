import React from "react"
import { Flex, Heading, Checkbox, Button, useDisclosure } from "@chakra-ui/react"
import { Field, Form, Formik } from "formik"

import AlertDialogContainer from "components/ui/AlertDialogContainer"
import useAuthStore from "store/useAuthStore"

const AdministrationRole = ({ role }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()

    const token = useAuthStore.useToken()

    const [ alertData, setAlertData ] = React.useState({ title: '', message: ''})

    const onSubmit = async (values) => {
        try {
            const url = process.env.NEXT_PUBLIC_API_URL + '/role/' + role.id
    
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
            } else {
                onOpen()
                setAlertData({ title: 'Success', message: 'Data has been updated'})
            }
        } catch (error) {
            onOpen()
            setAlertData({ title: 'Error', message: 'Client Error' })
        }
    }

    return (
        <Flex direction='column' gap='16px' alignItems='start' mb='16px'>
            <Heading as='h3' size='md' fontWeight='semibold'>Akses Administratif</Heading>
            <Formik initialValues={{
                is_lab_write: !!role.is_lab_write,
                is_role_write: !!role.is_role_write,
                is_user_write: !!role.is_user_write
            }} onSubmit={onSubmit}>
                {({ handleSubmit }) => (
                    <Form onSubmit={handleSubmit}>
                        <Flex direction='row' gap='16px' mb='16px' alignItems='start'>
                            <Field as={Checkbox} name='is_lab_write' defaultChecked={role.is_lab_write}>Manajemen Laboratorium</Field>
                            <Field as={Checkbox} name='is_role_write' defaultChecked={role.is_role_write}>Manajemen Role</Field>
                            <Field as={Checkbox} name='is_user_write' defaultChecked={role.is_user_write}>Manajemen User</Field>
                        </Flex>
                        <Button type='submit' colorScheme='green'>Save</Button>
                    </Form>
                )}
            </Formik>
            
            <AlertDialogContainer isOpen={isOpen} onClose={onClose} title={alertData.title} message={alertData.message} />
        </Flex>
    )
}

export default AdministrationRole