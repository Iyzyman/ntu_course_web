import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { useCreateCollectionMutation } from '@/data/clients/collections.api'
import { ring2 } from 'ldrs'
import { useState } from 'react'
ring2.register()
const formSchema = z.object({
  title: z
    .string()
    .min(1, {
      message: 'Title must be at least 1 character.',
    })
    .max(10, { message: 'Title must be at most 10 characters.' }),
})

export function CreateCollectionForm({
  className,
  setOpen,
  username,
}: {
  className: string
  setOpen: (open: boolean) => void
  username: string
}) {
  // state for displaying loading indicator
  const [loading, setLoading] = useState<boolean>(false)

  // using Mutation from CollectionClient
  const [createCollection] = useCreateCollectionMutation()

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // add a new collection into the database with the title
    setLoading(true)
    createCollection({
      collection_key: `${values.title.replace(' ', '-').toLowerCase()}`,
      collection_name: values.title,
      username,
    }).then(() => {
      setOpen(false)
    })
    console.log(values)
  }

  return (
    <div className={className}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="New Collection Name"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Don't worry! This collection title can be changed later.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">
            Save
            {loading && (
              // Default values shown
              <div className="mb-0 ml-2 mt-1 p-0">
                <l-ring-2
                  size="16"
                  stroke="5"
                  stroke-length="0.25"
                  bg-opacity="0.1"
                  speed="0.8"
                  color="black"
                ></l-ring-2>
              </div>
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
