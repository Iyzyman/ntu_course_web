import { FormControl, FormControlProps, InputLabel } from '@mui/material'

interface CustomFormControlProps extends FormControlProps {
  labelName: string
}

export const CustomFormControl = ({
  sx,
  children,
  labelName,
  ...rest
}: CustomFormControlProps) => {
  return (
    <FormControl
      sx={{
        width: 150,
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
      {labelName && (
        <InputLabel
          sx={{ color: '#A3A3A3', '&.Mui-focused': { color: '#A3A3A3' } }}
        >
          {labelName}
        </InputLabel>
      )}
      {children}
    </FormControl>
  )
}
