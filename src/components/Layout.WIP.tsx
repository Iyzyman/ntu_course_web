import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'

const WIPAlert = () => {
  return (
    <Alert
      variant="warning"
      className="my-4 mb-8"
    >
      <ExclamationTriangleIcon className="size-4" />
      <AlertTitle>WIP</AlertTitle>
      <AlertDescription>This feature is in development</AlertDescription>
    </Alert>
  )
}

export default WIPAlert
