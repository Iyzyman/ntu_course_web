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
import { useUpdateCollectionMutation } from '@/data/clients/collections.api'
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

export function EditCollectionForm({
  className,
  setOpen,
  collection_key,
  username,
}: {
  className: string
  setOpen: (e: boolean) => void
  collection_key: string
  username: string
}) {
  // set loading state for submit button
  const [loading, setLoading] = useState<boolean>(false)
  // using Mutation from CollectionClient
  const [updateCollection] = useUpdateCollectionMutation()

  // 1. Define your form, this should only contain editable fields.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  })

  // 2. Define update submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // add a new collection into the database with the title
    setLoading(true)
    updateCollection({
      collection_key,
      username,
      updated_name: values.title,
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
                  Enter your new collection name.
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
