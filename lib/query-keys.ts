// Central place to define all query keys
export const queryKeys = {
  // App
  app: {
    all: ["app"],
    lists: () => [...queryKeys.app.all, "list"],
    list: (filters: any) => [...queryKeys.app.lists(), filters],
    details: () => [...queryKeys.app.all, "detail"],
    detail: (id: string) => [...queryKeys.app.details(), id],
  },
  // Seeds
  seeds: {
    all: ["seeds"],
    lists: () => [...queryKeys.seeds.all, "list"],
    list: (filters: any) => [...queryKeys.seeds.lists(), filters],
    details: () => [...queryKeys.seeds.all, "detail"],
    detail: (id: string) => [...queryKeys.seeds.details(), id],
  },
  // Country
  country: {
    all: ["country"],
    lists: () => [...queryKeys.country.all, "list"],
    list: (filters: any) => [...queryKeys.country.lists(), filters],
    details: () => [...queryKeys.country.all, "detail"],
    detail: (id: string) => [...queryKeys.country.details(), id],
  },
  // Files
  files: {
    all: ["files"],
    lists: () => [...queryKeys.files.all, "list"],
    list: (filters: any) => [...queryKeys.files.lists(), filters],
    details: () => [...queryKeys.files.all, "detail"],
    detail: (id: string) => [...queryKeys.files.details(), id],
  },
  // Users
  users: {
    all: ["users"],
    lists: () => [...queryKeys.users.all, "list"],
    list: (filters: any) => [...queryKeys.users.lists(), filters],
    details: () => [...queryKeys.users.all, "detail"],
    detail: (id: string) => [...queryKeys.users.details(), id],
  },
  // Districts
  districts: {
    all: ["districts"],
    lists: () => [...queryKeys.districts.all, "list"],
    list: (filters: any) => [...queryKeys.districts.lists(), filters],
    details: () => [...queryKeys.districts.all, "detail"],
    detail: (id: string) => [...queryKeys.districts.details(), id],
  },
  // City
  city: {
    all: ["city"],
    lists: () => [...queryKeys.city.all, "list"],
    list: (filters: any) => [...queryKeys.city.lists(), filters],
    details: () => [...queryKeys.city.all, "detail"],
    detail: (id: string) => [...queryKeys.city.details(), id],
  },
  // Continents
  continents: {
    all: ["continents"],
    lists: () => [...queryKeys.continents.all, "list"],
    list: (filters: any) => [...queryKeys.continents.lists(), filters],
    details: () => [...queryKeys.continents.all, "detail"],
    detail: (id: string) => [...queryKeys.continents.details(), id],
  },
  // AppToken
  appToken: {
    all: ["appToken"],
    lists: () => [...queryKeys.appToken.all, "list"],
    list: (filters: any) => [...queryKeys.appToken.lists(), filters],
    details: () => [...queryKeys.appToken.all, "detail"],
    detail: (id: string) => [...queryKeys.appToken.details(), id],
  },
  // Badges
  badges: {
    all: ["badges"],
    lists: () => [...queryKeys.badges.all, "list"],
    list: (filters: any) => [...queryKeys.badges.lists(), filters],
    details: () => [...queryKeys.badges.all, "detail"],
    detail: (id: string) => [...queryKeys.badges.details(), id],
  },
  // UserStatus
  userStatus: {
    all: ["userStatus"],
    lists: () => [...queryKeys.userStatus.all, "list"],
    list: (filters: any) => [...queryKeys.userStatus.lists(), filters],
    details: () => [...queryKeys.userStatus.all, "detail"],
    detail: (id: string) => [...queryKeys.userStatus.details(), id],
  },
  // Permissions
  permissions: {
    all: ["permissions"],
    lists: () => [...queryKeys.permissions.all, "list"],
    list: (filters: any) => [...queryKeys.permissions.lists(), filters],
    details: () => [...queryKeys.permissions.all, "detail"],
    detail: (id: string) => [...queryKeys.permissions.details(), id],
  },
  // RolePermissions
  rolePermissions: {
    all: ["rolePermissions"],
    lists: () => [...queryKeys.rolePermissions.all, "list"],
    list: (filters: any) => [...queryKeys.rolePermissions.lists(), filters],
    details: () => [...queryKeys.rolePermissions.all, "detail"],
    detail: (id: string) => [...queryKeys.rolePermissions.details(), id],
  },
  // Feedbacks
  feedbacks: {
    all: ["feedbacks"],
    lists: () => [...queryKeys.feedbacks.all, "list"],
    list: (filters: any) => [...queryKeys.feedbacks.lists(), filters],
    details: () => [...queryKeys.feedbacks.all, "detail"],
    detail: (id: string) => [...queryKeys.feedbacks.details(), id],
  },
  // Swaggers
  swaggers: {
    all: ["swaggers"],
    lists: () => [...queryKeys.swaggers.all, "list"],
    list: (filters: any) => [...queryKeys.swaggers.lists(), filters],
    details: () => [...queryKeys.swaggers.all, "detail"],
    detail: (id: string) => [...queryKeys.swaggers.details(), id],
  },
  // Notifications
  notifications: {
    all: ["notifications"],
    lists: () => [...queryKeys.notifications.all, "list"],
    list: (filters: any) => [...queryKeys.notifications.lists(), filters],
    details: () => [...queryKeys.notifications.all, "detail"],
    detail: (id: string) => [...queryKeys.notifications.details(), id],
  },
  // ListCategory
  listCategory: {
    all: ["listCategory"],
    lists: () => [...queryKeys.listCategory.all, "list"],
    list: (filters: any) => [...queryKeys.listCategory.lists(), filters],
    details: () => [...queryKeys.listCategory.all, "detail"],
    detail: (id: string) => [...queryKeys.listCategory.details(), id],
  },
  // ListItems
  listItems: {
    all: ["listItems"],
    lists: () => [...queryKeys.listItems.all, "list"],
    list: (filters: any) => [...queryKeys.listItems.lists(), filters],
    details: () => [...queryKeys.listItems.all, "detail"],
    detail: (id: string) => [...queryKeys.listItems.details(), id],
  },
  // Moderations
  moderations: {
    all: ["moderations"],
    lists: () => [...queryKeys.moderations.all, "list"],
    list: (filters: any) => [...queryKeys.moderations.lists(), filters],
    details: () => [...queryKeys.moderations.all, "detail"],
    detail: (id: string) => [...queryKeys.moderations.details(), id],
  },
};
