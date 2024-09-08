import { Button } from '@/components/ui/Button'
import { AppThemeMode } from '@/data/static/app'
import { AppActions, AppSelectors } from '@/data/stores/app.slice'
import { useRootDispatch, useRootSelector } from '@/data/stores/root'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';

export const ThemeButton = () => {
  const dispatch = useRootDispatch()
  const [themeMode, setThemeMode] = [
    useRootSelector(AppSelectors.state).themeMode,
    AppActions.setThemeMode,
  ]

  const isDarkMode = themeMode === AppThemeMode.enum.dark
  const ThemeModeIcon = isDarkMode ? DarkModeOutlinedIcon : LightModeOutlinedIcon
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => {
        const inverseThemeMode = isDarkMode
          ? AppThemeMode.enum.light
          : AppThemeMode.enum.dark
        dispatch(setThemeMode(inverseThemeMode))
      }}
      className="group"
    >
      <ThemeModeIcon className="size-4" />
    </Button>
  )
}
