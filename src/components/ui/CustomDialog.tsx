import { DialogProps, Dialog, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material'

interface CustomDialogProps extends DialogProps {
    text: string
    buttonFunction: () => void
}

export const CustomDialog = ({ text, sx, buttonFunction, ...rest }: CustomDialogProps) => {
    return (
        <Dialog
            {...rest}
            sx={{
                ...sx,
            }}
        >
            <DialogContent>
                <DialogContentText fontFamily='Inter'>
                    {text}
                </DialogContentText>
            </DialogContent>

            <DialogActions>
                <Button onClick={buttonFunction}>Close</Button>
            </DialogActions>
        </ Dialog>
    )
}
