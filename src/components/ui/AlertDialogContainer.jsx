import {
    AlertDialog,
    AlertDialogBody, 
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button
} from "@chakra-ui/react"

const AlertDialogContainer = ({ onClose, isOpen, title, message, cancelable, isDangerous, onConfirm }) => {
    return (
        <AlertDialog
            motionPreset='slideInBottom'
            onClose={onClose}
            isOpen={isOpen}
        >
            <AlertDialogOverlay />

            <AlertDialogContent>
                <AlertDialogHeader>{title}</AlertDialogHeader>
                <AlertDialogCloseButton />
                <AlertDialogBody>{message}</AlertDialogBody>
                <AlertDialogFooter>
                    {cancelable && <Button ml={3} onClick={onClose}>Cancel</Button>}
                    <Button
                        colorScheme={isDangerous ? 'red' : 'green'}
                        ml={3}
                        onClick={onConfirm || onClose}>
                        Ok
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default AlertDialogContainer