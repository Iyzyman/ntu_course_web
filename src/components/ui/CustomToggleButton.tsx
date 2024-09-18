import { ToggleButtonGroup, toggleButtonGroupClasses } from '@mui/material'
import { styled } from '@mui/material/styles'

export const CustomToggleButtonGroup = styled(ToggleButtonGroup)(
  ({ theme }) => ({
    [`& .${toggleButtonGroupClasses.grouped}`]: {
      margin: theme.spacing(1),
      border: `1px solid #A3A3A3`,
      borderRadius: theme.shape.borderRadius,
      color: '#A3A3A3',
      '&.Mui-selected': {
        color: 'white', // Text color when selected
        backgroundColor: '#020817', // Background color when selected
        borderColor: 'white',
      },
    },
  }),
)
