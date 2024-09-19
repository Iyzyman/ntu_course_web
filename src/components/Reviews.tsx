import {
  Box,
  Stack,
  CircularProgress,
  Typography,
  Rating,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  TextField,
  Button,
} from '@mui/material'
import { createContext, useContext } from 'react'
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined'
import * as React from 'react'

interface ReviewScore {
  'Content Usefulness': number
  'Lecture Clarity': number
  'Assignment Difficulty': number
  'Team Dependency': number
  'Overall Workload': number
}

export type ReviewContext = {
  overall_score: ReviewScore
  reviews: {
    description: string
    author: string
    score: ReviewScore
    recommended: boolean
  }[]
}

const useReviewContext = () => {
  let ctxValue = useContext(ReviewContext)
  if (ctxValue === undefined) {
    const score: ReviewScore = {
      'Content Usefulness': 3,
      'Lecture Clarity': 3,
      'Assignment Difficulty': 3,
      'Team Dependency': 3,
      'Overall Workload': 3,
    }
    ctxValue = {
      overall_score: score,
      reviews: [
        {
          description: 'Lorem Ipsum Dolor Sit',
          author: 'Roland',
          score: score,
          recommended: true,
        },
        {
          description: 'Lorem Ipsum Dolor Sit',
          author: 'Roland',
          score: score,
          recommended: false,
        },
      ],
    }
  }
  return ctxValue
}

const ReviewContext = createContext<ReviewContext | undefined>(undefined)
export const AggregateReviewScore = () => {
  const { overall_score } = useReviewContext()
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      py={4}
      px={10}
    >
      {Object.entries(overall_score).map(([key, value]) => (
        <Stack
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Typography
              position="absolute"
              sx={{
                fontFamily: 'Inter',
                fontWeight: 300,
                fontSize: 25,
              }}
            >
              {value}/5
            </Typography>
            <CircularProgress
              sx={{ color: '#A3A3A3', position: 'absolute' }}
              variant="determinate"
              color="secondary"
              value={100}
              size={100}
              thickness={2}
            />
            <CircularProgress
              sx={{ color: '#11E4CC' }}
              variant="determinate"
              color="secondary"
              value={value * 20}
              size={100}
              thickness={2}
            />
          </Box>
          <Typography
            position="relative"
            sx={{
              fontFamily: 'Inter',
              fontWeight: 300,
              fontSize: 18,
            }}
          >
            {key}
          </Typography>
        </Stack>
      ))}
    </Box>
  )
}

export const AllReviews = () => {
  const { reviews } = useReviewContext()
  return (
    <Stack spacing={2}>
      <Typography sx={{ borderBottom: 2, borderColor: '#A3A3A3' }}>
        All Reviews
      </Typography>
      {reviews.map((review) => (
        <Box
          py={2}
          px={4}
          sx={{ border: 1, borderRadius: 1 }}
        >
          <Typography>{review.author}</Typography>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            px={4}
            py={2}
          >
            {Object.entries(review.score).map(([key, value]) => (
              <Stack alignItems="center">
                <Rating
                  sx={{ width: 'auto' }}
                  value={value}
                  readOnly
                />
                <Typography>{key}</Typography>
              </Stack>
            ))}
          </Box>
          <Typography>{review.description}</Typography>

          {review.recommended && (
            <Stack
              spacing={2}
              direction="row"
              py={2}
            >
              <ThumbUpOutlinedIcon />
              <Typography>{review.author} recommends this course</Typography>
            </Stack>
          )}
        </Box>
      ))}
    </Stack>
  )
}

export const ReviewForm = () => {
  const { overall_score } = useReviewContext()
  const [recommend, setRecommend] = React.useState<string>('Yes')
  const [name, setName] = React.useState<string>()
  const [rating, setRating] = React.useState<ReviewScore>(overall_score)
  const [reviewText, setReviewText] = React.useState<string>()

  const handleRecommendChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: string | null,
  ) => {
    if (newValue !== null) {
      setRecommend(newValue)
    }
  }
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }
  const handleRatingChange =
    (name: string) => (_event: React.SyntheticEvent, value: number | null) => {
      if (value !== null) {
        setRating((prevRating) => ({
          ...prevRating,
          [name]: value,
        }))
      }
    }
  const handleReviewTextChamge = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setReviewText(event.target.value)
  }
  const handleSubmit = () => {}

  return (
    <Stack
      spacing={2}
      py={4}
    >
      <Typography sx={{ borderBottom: 2, borderColor: '#A3A3A3' }}>
        Leave your Review
      </Typography>
      <div>
        <Typography>Name (Optional)</Typography>
        <TextField
          onChange={handleNameChange}
          value={name}
        />
      </div>
      <Select label="When did you take this module?" />
      <div>
        <Typography>Do you recommend this course?</Typography>
        <ToggleButtonGroup
          exclusive
          onChange={handleRecommendChange}
          value={recommend}
        >
          <ToggleButton value="Yes">Yes</ToggleButton>
          <ToggleButton value="No">No</ToggleButton>
        </ToggleButtonGroup>
      </div>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        {Object.entries(rating).map(([key, value]) => (
          <Stack alignItems="center">
            <Rating
              sx={{ width: 'auto' }}
              value={value}
              onChange={handleRatingChange(key)}
            />
            <Typography>{key}</Typography>
          </Stack>
        ))}
      </Box>
      <TextField
        onChange={handleReviewTextChamge}
        value={reviewText}
        label="Leave your review here"
      />
      <Button onClick={handleSubmit}>Submit</Button>
    </Stack>
  )
}
