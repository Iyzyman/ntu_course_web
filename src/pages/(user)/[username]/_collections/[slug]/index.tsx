import { useGetCollectionQuery } from '@/data/clients/collections.api'
import { useNavigate, useParams } from '@/router'
import { cn } from '@/utils/dom'
import { useEffect, useState } from 'react'
import { ErrorAlert, ProgressDemo } from '..'
import { Book } from '@/components/Book'
import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/Button'

const UserCollectionPage = () => {
  const navigate = useNavigate()
  const { username = '', slug = '' } = useParams('/:username/collections/:slug')
  const { user } = useUser()
  const user_uri = username!.slice(1)
  // State for checking if signedInUser is same as user_uri
  const [isSignedInUser, setIsSignedInUser] = useState<boolean>(false)

  useEffect(() => {
    if (user && user_uri && user.username !== null) {
      setIsSignedInUser(user.username === user_uri)
    }
  }, [user, user_uri])

  const isValidUsername = username.startsWith('@')
  // checks if the slug is not empty
  const isValidSlug = !!slug.length
  useEffect(() => {
    if (!(isValidUsername || isValidSlug)) {
      navigate('/')
    }
  }, [isValidSlug, isValidUsername, navigate])

  //#endregion  //*======== STORE ===========

  //#endregion  //*======== QUERIES ===========

  // get the current collection slug
  const { data, isLoading, isSuccess, isError } = useGetCollectionQuery({
    username: user_uri,
    collection_key: slug,
  })

  //#endregion  //*======== QUERIES ===========

  return (
    <main
      className={cn(
        'page-container',
        'flex flex-col gap-8',
        'place-items-center',
        '*:w-full',
      )}
    >
      <section
        style={{
          backgroundImage: `linear-gradient(to bottom, hsl(var(--muted)) 0%, transparent 70%)`,
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
        }}
        className={cn('relative w-full', 'rounded-lg', 'm-5', 'pt-8')}
      >
        {
          <h1
            className={cn(
              'text-3xl',
              'font-bold',
              'text-center',
              'text-white',
              'p-5',
            )}
          >
            {username}'s {slug} Collection
          </h1>
        }
        {isSuccess && user && slug && data.results[0].books.length === 0 && (
          <div className="m-5 grid w-full place-content-center justify-items-center">
            <p className="text-muted-foreground">
              No books in this collection yet! Add one!
            </p>
            <Button
              variant="outline"
              className="m-5 h-10 w-40 rounded-xl border border-transparent bg-black text-sm text-white dark:border-white"
              onClick={() => {
                navigate('/trending')
              }}
            >
              Go to Trending
            </Button>
          </div>
        )}
        {isLoading && (
          <div className="m-5 flex justify-center">
            <ProgressDemo />
          </div>
        )}

        {isError && <ErrorAlert error={'Something went wrong!'} />}
      </section>
      <section
        className={cn(
          'relative w-full',
          'rounded-lg',
          'm-5',
          'pt-8',
          'justify-content-center grid justify-items-center sm:grid-cols-2 md:grid-cols-3',
        )}
      >
        {isSuccess &&
          user &&
          slug &&
          data.results[0].books.map((book) => {
            return (
              <div
                className="m-5"
                key={book.key}
              >
                <Book
                  key={book.key}
                  book={book}
                >
                  <Book.BiggerBookCard
                    username={user!.username!}
                    collection_key={slug}
                    isSignedInUser={isSignedInUser}
                  />
                </Book>
              </div>
            )
          })}
      </section>
    </main>
  )
}

export default UserCollectionPage
