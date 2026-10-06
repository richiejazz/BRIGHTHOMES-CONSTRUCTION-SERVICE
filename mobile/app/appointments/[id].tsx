import { useLocalSearchParams } from 'expo-router'

import { useAppointment } from '../../src/api/account'
import { useAuth } from '../../src/auth/AuthProvider'
import { SignInRequired } from '../../src/auth/SignInRequired'
import { DetailList, MessageBlock, RequestDetailFrame, StatusPanel, SubjectHeader } from '../../src/components/activity/RequestDetail'
import { appointmentStatusNotes } from '../../src/components/activity/RequestRows'
import { formatDate, formatTime, formatWeekdayDate } from '../../src/lib/format'

export default function AppointmentDetailScreen() {
  return (
    <SignInRequired title="Sign in to view this request" message="Consultation requests are visible to the account that sent them.">
      <AppointmentDetail />
    </SignInRequired>
  )
}

function AppointmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const query = useAppointment(Number(id), useAuth().status === 'authenticated')
  return (
    <RequestDetailFrame query={query} noun="Consultation request">
      {(appointment) => (
        <>
          <SubjectHeader record={appointment} eyebrow="Consultation request" fallback="General consultation" />
          <StatusPanel status={appointment.status} note={appointmentStatusNotes[appointment.status]} />
          <DetailList
            title="Your preferred slot"
            rows={[
              { label: 'Preferred date', value: formatWeekdayDate(appointment.preferred_date) },
              { label: 'Preferred time', value: appointment.preferred_time ? formatTime(appointment.preferred_time) : null },
              { label: 'Time of day', value: appointment.time_window },
              { label: 'Time', value: !appointment.preferred_time && !appointment.time_window ? 'No preference' : null },
            ]}
          />
          <MessageBlock title="Your notes" message={appointment.message} />
          <DetailList
            title="Details"
            rows={[
              { label: 'Requested', value: formatDate(appointment.created_at) },
              { label: 'Name', value: appointment.name },
              { label: 'Email', value: appointment.email },
              { label: 'Phone', value: appointment.phone },
            ]}
          />
        </>
      )}
    </RequestDetailFrame>
  )
}
