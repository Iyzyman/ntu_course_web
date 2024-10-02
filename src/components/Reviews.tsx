import {
  Box,
  Stack,
  CircularProgress,
  Typography,
  Select,
  Button,
  MenuItem,
  SelectChangeEvent,
  ToggleButton,
} from '@mui/material'
import { CustomRating } from './ui/CustomRating'
import { CustomTextField } from './ui/CustomTextField'
import { CustomToggleButtonGroup } from './ui/CustomToggleButton'
import { createContext, useContext } from 'react'
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import * as React from 'react'
import { CustomFormControl } from './ui/CustomFormControl'

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
    date: string
  }[]
}

const useReviewContext = () => {
  let ctxValue = useContext(ReviewContext)
  if (ctxValue === undefined) {
    const score: ReviewScore = {
      'Content Usefulness': 3.0,
      'Lecture Clarity': 3.1,
      'Assignment Difficulty': 3.2,
      'Team Dependency': 3.3,
      'Overall Workload': 3.4,
    }
    ctxValue = {
      overall_score: score,
      reviews: [
        {
          description:
            'Consistency is very important for this course as there is no finals rather it is 4 test spread throughout the semester',
          author: 'David Teo',
          score: score,
          recommended: true,
          date: '2023 Semester 2',
        },
        {
          description:
            'Consistency is very important for this course as there is no finals rather it is 4 test spread throughout the semester',
          author: 'David Teo',
          score: score,
          recommended: false,
          date: '2023 Semester 2',
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
          sx={{ border: 1, borderRadius: 2 }}
        >
          <Typography
            fontSize={20}
            fontFamily="Inter"
            fontWeight={500}
          >
            {review.author}
          </Typography>
          <Typography
            fontSize={16}
            fontFamily="Inter"
            fontWeight={300}
          >
            Took the module on {review.date}
          </Typography>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            px={4}
            py={2}
          >
            {Object.entries(review.score).map(([key, value]) => (
              <Stack alignItems="center">
                <CustomRating
                  value={value}
                  readOnly
                />
                <Typography
                  fontSize={16}
                  fontFamily="Inter"
                >
                  {key}
                </Typography>
              </Stack>
            ))}
          </Box>
          <Typography
            fontSize={18}
            fontFamily="Inter"
          >
            {review.description}
          </Typography>

          {review.recommended && (
            <Stack
              spacing={2}
              direction="row"
              py={2}
            >
              <ThumbUpOutlinedIcon />
              <Typography
                fontSize={16}
                fontFamily="Inter"
              >
                {review.author} recommends this course
              </Typography>
            </Stack>
          )}
        </Box>
      ))}
    </Stack>
  )
}

export const ReviewForm = () => {
  const [recommend, setRecommend] = React.useState<string>('Yes')
  const [name, setName] = React.useState<string>()
  const [semester, setSemester] = React.useState<string>('')
  const [reviewText, setReviewText] = React.useState<string>()
  const [rating, setRating] = React.useState<ReviewScore>({
    'Content Usefulness': 0,
    'Lecture Clarity': 0,
    'Assignment Difficulty': 0,
    'Team Dependency': 0,
    'Overall Workload': 0,
  })

  const allsemesters = semesterOptions(2018, 2024)
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
  const handleSemesterChange = (event: SelectChangeEvent) => {
    setSemester(event.target.value)
  }
  const handleReviewTextChamge = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setReviewText(event.target.value)
  }
  const handleSubmit = () => {
    // let dataToSubmit = {
    //   name: { name },
    //   semester: { semester },
    //   recommend: { recommend },
    //   rating: { rating },
    //   description: { reviewText }
    // }
  }

  return (
    <Stack
      spacing={3}
      py={4}
    >
      <Typography sx={{ borderBottom: 2, borderColor: '#A3A3A3' }}>
        Leave your Review
      </Typography>

      <div>
        <CustomTextField
          onChange={handleNameChange}
          value={name}
          label="Name (Optional)"
          sx={{
            minWidth: 450,
          }}
        />
      </div>

      <CustomFormControl
        sx={{ width: 340 }}
        labelName="When did you take this course?"
      >
        <Select
          label="When did you take this course?"
          value={semester}
          onChange={handleSemesterChange}
          sx={{ color: '#A3A3A3' }}
          IconComponent={(props) => (
            <ExpandMoreIcon
              {...props}
              style={{ color: 'A3A3A3' }}
            />
          )}
        >
          {allsemesters.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </CustomFormControl>

      <div>
        <Typography>Do you recommend this course?</Typography>
        <CustomToggleButtonGroup
          exclusive
          onChange={handleRecommendChange}
          value={recommend}
        >
          <ToggleButton value="Yes">Yes</ToggleButton>
          <ToggleButton value="No">No</ToggleButton>
        </CustomToggleButtonGroup>
      </div>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        {Object.entries(rating).map(([key, value]) => (
          <Stack alignItems="center">
            <CustomRating
              value={value}
              onChange={handleRatingChange(key)}
            />
            <Typography>{key}</Typography>
          </Stack>
        ))}
      </Box>

      <CustomTextField
        onChange={handleReviewTextChamge}
        value={reviewText}
        placeholder="Leave your review here"
      />
      <Button
        onClick={handleSubmit}
        sx={{ width: 100, color: '#A3A3A3', border: 1 }}
      >
        Submit
      </Button>
    </Stack>
  )
}

const semesterOptions = (startYear: number, endYear: number) => {
  const semesters = []
  for (let year = startYear; year <= endYear; year++) {
    semesters.push(
      { value: `${year} Semester 1`, label: `${year} Semester 1` },
      { value: `${year} Semester 2`, label: `${year} Semester 2` },
    )
  }
  return semesters
}
