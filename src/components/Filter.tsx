import { List } from "@/types/shelvd"
import { Autocomplete, Checkbox, Chip, ListItemText, MenuItem, Select, SelectChangeEvent } from "@mui/material"
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { PropsWithChildren, useEffect, useState } from "react"
import { CustomFormControl } from "./ui/CustomFormControl"
import { CustomTextField } from "./ui/CustomTextField"

interface FilterProps extends PropsWithChildren {
    courseList: List
    onFilterChange: (list: List) => void
}

export const Filter = ({courseList, onFilterChange}: FilterProps) => {
    const [faculty, setFaculty] = useState<string[]>([])
    const [tags, setTags] = useState<string[]>([])

    const courseArray = courseList.courses
    const schoolList = courseArray.map(course=>course.school)
    const schoolFilters = [...new Set(schoolList)]
    const handleFacultyFilter = (event: SelectChangeEvent<string[]>) => {
        const {
            target: {value}
        } = event
        setFaculty(typeof value === 'string' ? value.split(',') : value)
    }

    const tagList = courseArray.flatMap(course=>course.tags)
    const tagFilters = [...new Set(tagList)].filter(value => value !== null)
    const handleTagFilter = (_event: React.SyntheticEvent, value: (string | undefined)[]) => {
       const tagArray = value.filter(item => item !== undefined) as string[]
       setTags(tagArray)
    }

    useEffect(() => {
        const filteredbyfaculty = (faculty.length !== 0) ? courseArray.filter((course)=>(
            faculty.includes(course.school as string)
        )) : courseArray
        const filteredbytags = (tags.length !== 0) ? filteredbyfaculty.filter((course)=>(
            tags.every((tag) => course.tags?.includes(tag))
        )) : filteredbyfaculty

        onFilterChange({
            ...courseList,
            courses: filteredbytags,
        })
    }, [faculty, tags, courseArray, courseList, onFilterChange])

    return (
        <aside className="flex gap-10 items-center px-10 pb-10 pt-5">
            <h4>Filter by:</h4>
            <CustomFormControl labelName="Faculty">
                <Select
                    id="filterByFaculty"
                    label="Faculty"
                    multiple
                    value={faculty}
                    renderValue={(selected)=>selected.join(', ')}
                    onChange={handleFacultyFilter}
                    MenuProps={{    
                        PaperProps: {
                            style: {
                            maxHeight: 350,
                            },
                        },
                    }}
                >
                    {schoolFilters.map((schoolName)=>(
                        schoolName &&
                        <MenuItem key={schoolName} value={schoolName}>
                            <Checkbox checked={faculty.includes(schoolName)}/>
                            <ListItemText primary={schoolName}/>
                        </MenuItem>
                    ))}
                </Select>
            </CustomFormControl>

            <Autocomplete
                id='filterByTags'
                multiple
                limitTags={1}
                options={tagFilters}
                onChange={handleTagFilter}
                renderInput={(params) => 
                    <CustomTextField {...params} sx={{width: 400}} label='Tags'/>
                }
                clearIcon={<CloseIcon sx={{ color: '#A3A3A3' }} />}
                popupIcon={<ExpandMoreIcon sx={{ color: '#A3A3A3' }} />} 
                renderTags={(value, getTagProps) => 
                    value.map((option, index)=> (
                        <Chip 
                            {...getTagProps({index})}
                            label={option}
                            sx={{
                                backgroundColor: '#A3A3A3',
                                color: 'white',
                                fontFamily: 'Inter'
                            }}/>
                    ))
                }
            />
        </aside>
    )
}