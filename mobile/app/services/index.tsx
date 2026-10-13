import { Redirect } from 'expo-router'

// Services now live in the Explore tab; this keeps older /services links working.
export default function ServicesRedirect() {
  return <Redirect href={{ pathname: '/explore', params: { section: 'services' } }} />
}
