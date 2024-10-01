import { List } from "@/types/shelvd"
import { Checkbox, ListItemText, MenuItem, Select, SelectChangeEvent } from "@mui/material"
import { PropsWithChildren, useEffect, useState } from "react"
import { CustomFormControl } from "./ui/CustomFormControl"

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
    const tagFilters = [...new Set(tagList)]
    const handleTagFilter = (event: SelectChangeEvent<string[]>) => {
        const {
            target: {value}
        } = event
        setTags(typeof value === 'string' ? value.split(',') : value) 
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
                    label="Faculty"
                    multiple
                    value={faculty}
                    renderValue={(selected)=>selected.join(', ')}
                    onChange={handleFacultyFilter}
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

            <CustomFormControl labelName="Tags">
                <Select
                    label="Tags"
                    multiple
                    value={tags}
                    renderValue={(selected)=>selected.join(', ')}
                    onChange={handleTagFilter}
                >
                    {tagFilters.map((tagName)=>(
                        tagName &&
                        <MenuItem key={tagName} value={tagName}>
                            <Checkbox checked={tags.includes(tagName)}/>
                            <ListItemText primary={tagName}/>
                        </MenuItem>
                    ))}
                </Select>
            </CustomFormControl>
        </aside>
    )
}