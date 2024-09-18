import { RatingProps, Rating } from '@mui/material'

export const CustomRating = ({ sx, ...rest }: RatingProps) => {
  return (
    <Rating
      sx={{
        width: 'auto',
        '& .MuiRating-iconFilled': { color: 'white' },
        '& .MuiRating-iconEmpty': { color: '#A3A3A3' },
        ...sx,
      }}
      {...rest}
    />
  )
}
