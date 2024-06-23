import React from "react"
import { Button, Flex, Heading, Input, useDisclosure } from "@chakra-ui/react"
import { Field, Form, Formik } from "formik"

import AlertDialogContainer from "components/ui/AlertDialogContainer"
import useAuthStore from "store/useAuthStore"

const RoleNameForm = ({ role, setData }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()

    const token = useAuthStore.useToken()

    const [ alertData, setAlertData ] = React.useState({ title: '', message: '', isDangerous: false, cancelable: false, onConfirm: onClose})

    const onConfirm = id => async () => {
        try {
            const url = process.env.NEXT_PUBLIC_API_URL + '/role/' + id
            console.log(url)
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
                setData(data => data.filter(role => role.id !== id))
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
        <Flex direction='column' gap='16px' alignItems='start'>
            <Heading as='h3' size='md' fontWeight='semibold'>Edit Role</Heading>
        
            <Formik
                initialValues={{ name: role.name }}
                onSubmit={onSubmit}
            >
                {({ handleSubmit }) => (
                    <Form onSubmit={handleSubmit}>
                        <Flex direction='row' gap='16px' alignItems='start'>
                            <Field as={Input} name='name' placeholder='Nama' defaultValue={role.name} required></Field>
                            <Button type='submit' colorScheme='green'>Simpan</Button>
                            <Button colorScheme='red' onClick={onDelete(role.id)}>Hapus</Button>
                        </Flex>
                    </Form>
                )}
            </Formik>
            
            <AlertDialogContainer isOpen={isOpen} onClose={onClose} title={alertData.title} message={alertData.message} isDangerous={alertData.isDangerous} cancelable={alertData.cancelable} onConfirm={alertData.onConfirm}/>
        </Flex>
    )
}

export default RoleNameForm