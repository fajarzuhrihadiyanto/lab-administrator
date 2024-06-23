import React from "react"
import { Button, Checkbox, Flex, Grid, GridItem, Heading, useDisclosure } from "@chakra-ui/react"
import { Field, FieldArray, Form, Formik } from "formik"

import AlertDialogContainer from "components/ui/AlertDialogContainer"
import useAuthStore from "store/useAuthStore"

const LabRole = ({ role, role_lab, labs }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()

    const token = useAuthStore.useToken()

    const [ alertData, setAlertData ] = React.useState({ title: '', message: ''})

    const onSubmit = async (values) => {
        try {
            const url = process.env.NEXT_PUBLIC_API_URL + '/access/' + role.id
    
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
            <Heading as='h3' size='md' fontWeight='semibold'>Akses Laboratorium</Heading>
            <Formik
                initialValues={{
                    role_id: role.id,
                    access: labs.map(lab => ({
                        lab_id: lab.id,
                        is_write: !!role_lab.find(rl => rl.role_id === role.id && rl.lab_id === lab.id && rl.is_write)
                    }))
                }}
                onSubmit={onSubmit}
            >
                {({ handleSubmit }) => (
                    <Form onSubmit={handleSubmit}>
                        <FieldArray
                            name='access'
                            render={() => (
                                <Grid templateColumns='repeat(4, 1fr)' gap='16px' mb='16px' alignSelf='stretch'>
                                    {labs.map((lab, index) => (
                                        <GridItem key={index}>
                                            <Field
                                                as={Checkbox}
                                                name={`access[${index}].is_write`}
                                                defaultChecked={role_lab.find(rl => rl.role_id === role.id && rl.lab_id === lab.id && rl.is_write)}
                                            >
                                                {lab.name}
                                            </Field>
                                        </GridItem>
                                    ))}
                                </Grid>
                            )}
                        />
                        <Button type='submit' colorScheme='green'>Save</Button>
                    </Form>
                )}
            </Formik>

            <AlertDialogContainer isOpen={isOpen} onClose={onClose} title={alertData.title} message={alertData.message} />
        </Flex>
    )
}

export default LabRole