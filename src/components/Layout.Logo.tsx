import { cn } from '@/utils/dom'
import { useNavigate } from 'react-router-dom'

export const Logo = () => {
  const navigate = useNavigate()

  return (
    <div
      className={cn('flex flex-row place-items-center gap-1', 'cursor-pointer')}
      onClick={() => {
        navigate(`/`, {
          unstable_viewTransition: true,
        })
      }}
    >
      <b
        className={cn(
          'max-w-prose text-center tracking-tight',
          'h3 sm:h2 whitespace-nowrap',
        )}
      >
        <div
          style={{
            display: 'flex',
          }}
        >
          <div
            className="logo"
            style={{
              fontFamily: 'Bebas Neue',
              fontWeight: '400',
              fontSize: '3rem',
              paddingRight: '0.5rem',
            }}
          >
            CF
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: '400' }}>
            coursefinder
          </span>
        </div>
      </b>
    </div>
  )
}
