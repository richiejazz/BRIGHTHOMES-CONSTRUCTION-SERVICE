import { useLocalSearchParams } from 'expo-router'

import { useEnquiry } from '../../src/api/account'
import { useAuth } from '../../src/auth/AuthProvider'
import { SignInRequired } from '../../src/auth/SignInRequired'
import { DetailList, MessageBlock, RequestDetailFrame, StatusPanel, SubjectHeader } from '../../src/components/activity/RequestDetail'
import { enquiryStatusNotes } from '../../src/components/activity/RequestRows'
import { formatDate } from '../../src/lib/format'

export default function EnquiryDetailScreen() {
  return (
    <SignInRequired title="Sign in to view this enquiry" message="Enquiries are visible to the account that sent them.">
      <EnquiryDetail />
    </SignInRequired>
  )
}

function EnquiryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const query = useEnquiry(Number(id), useAuth().status === 'authenticated')
  return (
    <RequestDetailFrame query={query} noun="Enquiry">
      {(enquiry) => (
        <>
          <SubjectHeader record={enquiry} eyebrow="Enquiry" fallback="General enquiry" />
          <StatusPanel status={enquiry.status} note={enquiryStatusNotes[enquiry.status]} />
          <MessageBlock title="Your message" message={enquiry.message} />
          <DetailList
            title="Details"
            rows={[
              { label: 'Sent', value: formatDate(enquiry.created_at) },
              { label: 'Name', value: enquiry.name },
              { label: 'Email', value: enquiry.email },
              { label: 'Phone', value: enquiry.phone },
            ]}
          />
        </>
      )}
    </RequestDetailFrame>
  )
}
