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
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import * as React from 'react'
import { CustomFormControl } from './ui/CustomFormControl'
import { ReviewProps, ReviewScore, SubmitReviewProps } from '@/types/courseitem'
import { useParams } from '@/router'
import { usePutReview } from './hooks/useCourseFinderHooks'
import { useUser } from '@clerk/clerk-react'
import { CustomDialog } from './ui/CustomDialog'
import {
  DefaultError,
  QueryObserverResult,
  RefetchOptions,
} from '@tanstack/react-query'

interface ReviewFormProps {
  refetch: (
    options?: RefetchOptions,
  ) => Promise<QueryObserverResult<unknown, DefaultError>>
}

export const AggregateReviewScore = ({ rating }: ReviewProps) => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      py={4}
      px={10}
    >
      {Object.entries(rating).map(([key, value]) => (
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
              {value.toFixed(1)}/5
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

export const AllReviews = ({ reviews }: ReviewProps) => {
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
            {review.displayName ?? 'Anonymous'}
          </Typography>
          <Typography
            fontSize={16}
            fontFamily="Inter"
            fontWeight={300}
          >
            Took the module on {review.course_date}
          </Typography>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            px={4}
            py={2}
          >
            {Object.entries(review.rating).map(([key, value]) => (
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
            {review.review_text}
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
                {review.displayName ?? 'Anonymous'} recommends this course
              </Typography>
            </Stack>
          )}
        </Box>
      ))}
    </Stack>
  )
}

export const ReviewForm = ({ refetch }: ReviewFormProps) => {
  const { user, isSignedIn } = useUser()
  const { slug } = useParams('/course/:slug')
  const { mutate } = usePutReview()

  const [recommend, setRecommend] = React.useState<boolean>(true)
  const [name, setName] = React.useState<string>()
  const [semester, setSemester] = React.useState<string>()
  const [reviewText, setReviewText] = React.useState<string>()
  const [rating, setRating] = React.useState<ReviewScore>({
    'Content Usefulness': 0,
    'Lecture Clarity': 0,
    'Assignment Difficulty': 0,
    'Team Dependency': 0,
    'Overall Workload': 0,
  })

  const [dialogText, setDialogText] = React.useState<string>('')
  const [openDialog, setOpenDialog] = React.useState<boolean>(false)

  const allsemesters = semesterOptions(2018, 2024)
  const handleRecommendChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: boolean | null,
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
    if (!user || !isSignedIn) {
      setDialogText('Please sign in to submit a review')
      setOpenDialog(true)
      return
    } else if (!semester) {
      setDialogText('Please enter the date you took this course')
      setOpenDialog(true)
      return
    }

    const dataToSubmit: SubmitReviewProps = {
      course_id: slug,
      rating: rating,
      user_id: user.id,
      displayName: name,
      review_text: reviewText,
      course_date: semester,
      recommended: recommend,
    }

    mutate(dataToSubmit, {
      onSuccess: () => {
        refetch()
        setDialogText('Submission successful!')
        setOpenDialog(true)
      },
      onError: () => {
        setDialogText('Submission failed, please try again')
        setOpenDialog(true)
      },
    })
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
          <ToggleButton value={true}>Yes</ToggleButton>
          <ToggleButton value={false}>No</ToggleButton>
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
      <CustomDialog
        text={dialogText}
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        buttonFunction={() => setOpenDialog(false)}
      />
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
