import { Nav } from '@/components/Layout.Nav'
import { SEO } from '@/components/Layout.SEO'
import { Search } from '@/components/Layout.Search'
import { RenderGuard } from '@/components/providers/render.provider'
import { Toaster } from '@/components/ui/Sonner'
import { Outlet } from 'react-router-dom'

const AppLayout = ({ seo }: { seo?: SEO }) => {
  return (
    <RenderGuard>
      <SEO {...seo} />
      <Toaster />
      <Search>
        <Nav />
        <Outlet />
      </Search>
    </RenderGuard>
  )
}

export default AppLayout
