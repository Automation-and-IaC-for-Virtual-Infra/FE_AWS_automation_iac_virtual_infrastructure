export const ALL_VALUE = 'ALL'

export const DATE_FORMAT = {
  FULL: 'yyyy-MM-dd HH:mm:ss',
  DATE_ONLY: 'yyyy-MM-dd',
}

export enum NOTIFICATION_TYPES_ENUM {
  BUILD_SUCCESS = 1,
  APPLY_SUCCESS = 2,
  BUILD_ERROR = 3,
  APPLY_ERROR = 4,
  NEED_APPROVAL = 5,
}

export const NOTIFICATION_LABELS: Record<number, string> = {
  [NOTIFICATION_TYPES_ENUM.BUILD_SUCCESS]: 'BUILD SUCCESS',
  [NOTIFICATION_TYPES_ENUM.APPLY_SUCCESS]: 'APPLY SUCCESS',
  [NOTIFICATION_TYPES_ENUM.BUILD_ERROR]: 'BUILD ERROR',
  [NOTIFICATION_TYPES_ENUM.APPLY_ERROR]: 'APPLY ERROR',
  [NOTIFICATION_TYPES_ENUM.NEED_APPROVAL]: 'NEED APPROVAL',
}

export const NOTIFICATION_OPTIONS = [
  { label: 'All types', value: ALL_VALUE },
  { label: 'Build Success', value: NOTIFICATION_TYPES_ENUM.BUILD_SUCCESS.toString() },
  { label: 'Apply Success', value: NOTIFICATION_TYPES_ENUM.APPLY_SUCCESS.toString() },
  { label: 'Build Error', value: NOTIFICATION_TYPES_ENUM.BUILD_ERROR.toString() },
  { label: 'Apply Error', value: NOTIFICATION_TYPES_ENUM.APPLY_ERROR.toString() },
  { label: 'Need Approval', value: NOTIFICATION_TYPES_ENUM.NEED_APPROVAL.toString() },
]

export const SERVICE_STATUS = {
  RUNNING: 1,
  DELETED: 2,
}

export const LOCALSTORAGE_KEYS = {
  IS_DEPLOYING: 'isDeploying',
  CREATED_AT_DEPLOYMENT: 'createdAtDeployment',
}
