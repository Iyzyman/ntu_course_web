import { AppBaseUrl, AppDescription, AppName } from '@/data/static/app'
import { Helmet, HelmetProps } from 'react-helmet-async'

export type SEO = HelmetProps
export const SEO = (props: SEO) => {
  return (
    <Helmet
      defaultTitle={AppName}
      titleTemplate={`%s | ${AppName}`}
      {...props}
    >
      <html lang="en" />
      <meta charSet="utf-8" />
      {/* base element */}
      <base
        target="_blank"
        href={AppBaseUrl()}
      />

      {/* multiple meta elements */}
      <meta
        name="description"
        content={AppDescription}
      />

      {/* <link
        rel="icon"
        type="image/svg+xml"
        href="/vite.svg"
      /> */}
      <link
        rel="icon"
        href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>"
      />

      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      />
    </Helmet>
  )
}
