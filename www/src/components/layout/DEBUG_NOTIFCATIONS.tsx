import {
  IncidentStatus,
  Notification as NotificationT,
  NotificationType,
} from 'generated/graphql'

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>
}

const DEBUG_PERSON = { name: 'Person Lastname', email: 'person@plural.sh', id: '1' }

const DEBUG_REPO = {
  id: 'a051a0bf-61b5-4ab5-813d-2c541c83a979',
  name: 'Repo name',
  icon: 'https://plural-assets.s3.us-east-2.amazonaws.com/uploads/repos/eb88ca01-21d6-464f-8fd5-f481b385c166/airflow.png?v=63827245273',
  darkIcon: '',
}

const DEBUG_NOTIFICATION: RecursivePartial<NotificationT> = {
  id: '3847573920',
  type: NotificationType.Message,
  msg: `Lorem ipsum dolor sit amet, \`consectetur adipiscing elit\`, sed do eiusmod tempor *incididunt* ut labore et dolore **magna aliqua**.
  \`\`\`
  export function WithNotifications({ children }: WithNotificationsProps) {
    const [notifications] = usePaginatedQuery(NOTIFICATIONS_QUERY,
      { variables: {} },
      data => data.notifications)
  
    return children({
      notificationsCount: notifications.length,
    })
  }  \`\`\`
  `,
  message: {
    creator: DEBUG_PERSON,
    id: '1',
    text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Neque aliquam vestibulum morbi blandit cursus. Neque aliquam vestibulum morbi blandit cursus risus at ultrices. Elit eget gravida cum sociis natoque penatibus et magnis dis. Eu augue ut lectus arcu bibendum at varius vel pharetra. Nulla aliquet porttitor lacus luctus accumsan. Diam sit amet nisl suscipit adipiscing bibendum est. Venenatis a condimentum vitae sapien pellentesque habitant morbi tristique. Sapien eget mi proin sed libero enim sed faucibus. Amet facilisis magna etiam tempor. Lectus urna duis convallis convallis tellus id interdum. Eu non diam phasellus vestibulum lorem sed risus. Lacus laoreet non curabitur gravida arcu. Nulla facilisi morbi tempus iaculis. Tincidunt praesent semper feugiat nibh sed pulvinar proin gravida hendrerit.

  Nunc sed augue lacus viverra vitae congue eu consequat ac. Integer eget aliquet nibh praesent tristique. Nibh ipsum consequat nisl vel pretium lectus quam id leo. Facilisi cras fermentum odio eu feugiat pretium nibh ipsum consequat. Aliquam faucibus purus in massa tempor nec feugiat nisl. Aenean et tortor at risus viverra adipiscing at in tellus. Sed augue lacus viverra vitae congue eu. Augue lacus viverra vitae congue eu consequat ac felis. Parturient montes nascetur ridiculus mus mauris. Malesuada fames ac turpis egestas sed tempus. Nulla aliquet porttitor lacus luctus accumsan tortor posuere ac ut. Et molestie ac feugiat sed lectus vestibulum. Lorem ipsum dolor sit amet consectetur adipiscing elit pellentesque. Nascetur ridiculus mus mauris vitae. Cursus euismod quis viverra nibh cras pulvinar mattis nunc sed.`,
  },
  actor: DEBUG_PERSON,
  incident: {
    id: '123',
    title: 'Message title that is kinda long',
    repository: DEBUG_REPO,
    creator: DEBUG_PERSON,
    severity: 1,
    status: IncidentStatus.Complete,
  },
  repository: DEBUG_REPO,
  insertedAt: new Date('2022-09-01T22:12:46Z'),
}

export const DEBUG_NOTIFCATIONS = [
  { ...DEBUG_NOTIFICATION, ...{ type: NotificationType.Message } },
  { ...DEBUG_NOTIFICATION, ...{ type: NotificationType.Locked } },
  { ...DEBUG_NOTIFICATION, ...{ type: NotificationType.Mention } },
  { ...DEBUG_NOTIFICATION, ...{ type: NotificationType.IncidentUpdate } },
  { ...DEBUG_NOTIFICATION, ...{ type: NotificationType.Message, msg: undefined } },
  { ...DEBUG_NOTIFICATION, ...{ type: NotificationType.Locked, msg: undefined } },
  { ...DEBUG_NOTIFICATION, ...{ type: NotificationType.Mention, msg: undefined } },
  { ...DEBUG_NOTIFICATION, ...{ type: NotificationType.IncidentUpdate, msg: undefined } },
]
