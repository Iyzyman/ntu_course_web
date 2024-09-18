import { TextFieldProps, TextField } from '@mui/material'

export const CustomTextField = ({ children, sx, ...rest }: TextFieldProps) => {
  return (
    <TextField
      sx={{
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: '#A3A3A3',
          },
          '&:hover fieldset': {
            borderColor: '#A3A3A3',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#A3A3A3',
          },
          color: '#A3A3A3',
        },
        ...sx,
      }}
      {...rest}
    >
      {children}
    </TextField>
  )
}
