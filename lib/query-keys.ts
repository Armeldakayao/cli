// Central place to define all query keys
export const queryKeys = {
  // App
  app: {
    all: ["app"] as const,
    lists: () => [...queryKeys.app.all, "list"] as const,
    list: (filters: any) => [...queryKeys.app.lists(), filters] as const,
    details: () => [...queryKeys.app.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.app.details(), id] as const,
  },
  // Users
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters: any) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
  // Contacts
  contacts: {
    all: ["contacts"] as const,
    lists: () => [...queryKeys.contacts.all, "list"] as const,
    list: (filters: any) => [...queryKeys.contacts.lists(), filters] as const,
    details: () => [...queryKeys.contacts.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.contacts.details(), id] as const,
  },
  // Roles
  roles: {
    all: ["roles"] as const,
    lists: () => [...queryKeys.roles.all, "list"] as const,
    list: (filters: any) => [...queryKeys.roles.lists(), filters] as const,
    details: () => [...queryKeys.roles.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.roles.details(), id] as const,
  },
  // Groups
  groups: {
    all: ["groups"] as const,
    lists: () => [...queryKeys.groups.all, "list"] as const,
    list: (filters: any) => [...queryKeys.groups.lists(), filters] as const,
    details: () => [...queryKeys.groups.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.groups.details(), id] as const,
  },
  // Permissions
  permissions: {
    all: ["permissions"] as const,
    lists: () => [...queryKeys.permissions.all, "list"] as const,
    list: (filters: any) => [...queryKeys.permissions.lists(), filters] as const,
    details: () => [...queryKeys.permissions.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.permissions.details(), id] as const,
  },
  // GroupPermission
  groupPermission: {
    all: ["groupPermission"] as const,
    lists: () => [...queryKeys.groupPermission.all, "list"] as const,
    list: (filters: any) => [...queryKeys.groupPermission.lists(), filters] as const,
    details: () => [...queryKeys.groupPermission.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.groupPermission.details(), id] as const,
  },
  // Files
  files: {
    all: ["files"] as const,
    lists: () => [...queryKeys.files.all, "list"] as const,
    list: (filters: any) => [...queryKeys.files.lists(), filters] as const,
    details: () => [...queryKeys.files.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.files.details(), id] as const,
  },
  // ContactType
  contactType: {
    all: ["contactType"] as const,
    lists: () => [...queryKeys.contactType.all, "list"] as const,
    list: (filters: any) => [...queryKeys.contactType.lists(), filters] as const,
    details: () => [...queryKeys.contactType.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.contactType.details(), id] as const,
  },
  // Departments
  departments: {
    all: ["departments"] as const,
    lists: () => [...queryKeys.departments.all, "list"] as const,
    list: (filters: any) => [...queryKeys.departments.lists(), filters] as const,
    details: () => [...queryKeys.departments.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.departments.details(), id] as const,
  },
  // Functions
  functions: {
    all: ["functions"] as const,
    lists: () => [...queryKeys.functions.all, "list"] as const,
    list: (filters: any) => [...queryKeys.functions.lists(), filters] as const,
    details: () => [...queryKeys.functions.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.functions.details(), id] as const,
  },
  // Events
  events: {
    all: ["events"] as const,
    lists: () => [...queryKeys.events.all, "list"] as const,
    list: (filters: any) => [...queryKeys.events.lists(), filters] as const,
    details: () => [...queryKeys.events.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.events.details(), id] as const,
  },
  // Accounts
  accounts: {
    all: ["accounts"] as const,
    lists: () => [...queryKeys.accounts.all, "list"] as const,
    list: (filters: any) => [...queryKeys.accounts.lists(), filters] as const,
    details: () => [...queryKeys.accounts.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.accounts.details(), id] as const,
  },
  // AccountTypes
  accountTypes: {
    all: ["accountTypes"] as const,
    lists: () => [...queryKeys.accountTypes.all, "list"] as const,
    list: (filters: any) => [...queryKeys.accountTypes.lists(), filters] as const,
    details: () => [...queryKeys.accountTypes.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.accountTypes.details(), id] as const,
  },
  // Prop
  prop: {
    all: ["prop"] as const,
    lists: () => [...queryKeys.prop.all, "list"] as const,
    list: (filters: any) => [...queryKeys.prop.lists(), filters] as const,
    details: () => [...queryKeys.prop.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.prop.details(), id] as const,
  },
  // PropStatusOccupy
  propStatusOccupy: {
    all: ["propStatusOccupy"] as const,
    lists: () => [...queryKeys.propStatusOccupy.all, "list"] as const,
    list: (filters: any) => [...queryKeys.propStatusOccupy.lists(), filters] as const,
    details: () => [...queryKeys.propStatusOccupy.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.propStatusOccupy.details(), id] as const,
  },
  // PropType
  propType: {
    all: ["propType"] as const,
    lists: () => [...queryKeys.propType.all, "list"] as const,
    list: (filters: any) => [...queryKeys.propType.lists(), filters] as const,
    details: () => [...queryKeys.propType.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.propType.details(), id] as const,
  },
  // AccountStatus
  accountStatus: {
    all: ["accountStatus"] as const,
    lists: () => [...queryKeys.accountStatus.all, "list"] as const,
    list: (filters: any) => [...queryKeys.accountStatus.lists(), filters] as const,
    details: () => [...queryKeys.accountStatus.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.accountStatus.details(), id] as const,
  },
  // Planning
  planning: {
    all: ["planning"] as const,
    lists: () => [...queryKeys.planning.all, "list"] as const,
    list: (filters: any) => [...queryKeys.planning.lists(), filters] as const,
    details: () => [...queryKeys.planning.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.planning.details(), id] as const,
  },
  // PlanningApplicationType
  planningApplicationType: {
    all: ["planningApplicationType"] as const,
    lists: () => [...queryKeys.planningApplicationType.all, "list"] as const,
    list: (filters: any) => [...queryKeys.planningApplicationType.lists(), filters] as const,
    details: () => [...queryKeys.planningApplicationType.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.planningApplicationType.details(), id] as const,
  },
  // PlanningStatus
  planningStatus: {
    all: ["planningStatus"] as const,
    lists: () => [...queryKeys.planningStatus.all, "list"] as const,
    list: (filters: any) => [...queryKeys.planningStatus.lists(), filters] as const,
    details: () => [...queryKeys.planningStatus.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.planningStatus.details(), id] as const,
  },
  // BuildingControl
  buildingControl: {
    all: ["buildingControl"] as const,
    lists: () => [...queryKeys.buildingControl.all, "list"] as const,
    list: (filters: any) => [...queryKeys.buildingControl.lists(), filters] as const,
    details: () => [...queryKeys.buildingControl.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.buildingControl.details(), id] as const,
  },
  // BuildingControlStatus
  buildingControlStatus: {
    all: ["buildingControlStatus"] as const,
    lists: () => [...queryKeys.buildingControlStatus.all, "list"] as const,
    list: (filters: any) => [...queryKeys.buildingControlStatus.lists(), filters] as const,
    details: () => [...queryKeys.buildingControlStatus.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.buildingControlStatus.details(), id] as const,
  },
  // FunctionTypes
  functionTypes: {
    all: ["functionTypes"] as const,
    lists: () => [...queryKeys.functionTypes.all, "list"] as const,
    list: (filters: any) => [...queryKeys.functionTypes.lists(), filters] as const,
    details: () => [...queryKeys.functionTypes.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.functionTypes.details(), id] as const,
  },
  // Status
  status: {
    all: ["status"] as const,
    lists: () => [...queryKeys.status.all, "list"] as const,
    list: (filters: any) => [...queryKeys.status.lists(), filters] as const,
    details: () => [...queryKeys.status.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.status.details(), id] as const,
  },
  // EventFunctions
  eventFunctions: {
    all: ["eventFunctions"] as const,
    lists: () => [...queryKeys.eventFunctions.all, "list"] as const,
    list: (filters: any) => [...queryKeys.eventFunctions.lists(), filters] as const,
    details: () => [...queryKeys.eventFunctions.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.eventFunctions.details(), id] as const,
  },
  // Demos
  demos: {
    all: ["demos"] as const,
    lists: () => [...queryKeys.demos.all, "list"] as const,
    list: (filters: any) => [...queryKeys.demos.lists(), filters] as const,
    details: () => [...queryKeys.demos.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.demos.details(), id] as const,
  },
  // Forms
  forms: {
    all: ["forms"] as const,
    lists: () => [...queryKeys.forms.all, "list"] as const,
    list: (filters: any) => [...queryKeys.forms.lists(), filters] as const,
    details: () => [...queryKeys.forms.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.forms.details(), id] as const,
  },
  // FormsResponses
  formsResponses: {
    all: ["formsResponses"] as const,
    lists: () => [...queryKeys.formsResponses.all, "list"] as const,
    list: (filters: any) => [...queryKeys.formsResponses.lists(), filters] as const,
    details: () => [...queryKeys.formsResponses.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.formsResponses.details(), id] as const,
  },
  // Function-depts
  functiondepts: {
    all: ["functiondepts"] as const,
    lists: () => [...queryKeys.functiondepts.all, "list"] as const,
    list: (filters: any) => [...queryKeys.functiondepts.lists(), filters] as const,
    details: () => [...queryKeys.functiondepts.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.functiondepts.details(), id] as const,
  },
  // FunctionContacts
  functionContacts: {
    all: ["functionContacts"] as const,
    lists: () => [...queryKeys.functionContacts.all, "list"] as const,
    list: (filters: any) => [...queryKeys.functionContacts.lists(), filters] as const,
    details: () => [...queryKeys.functionContacts.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.functionContacts.details(), id] as const,
  },
  // DemoFileRow
  demoFileRow: {
    all: ["demoFileRow"] as const,
    lists: () => [...queryKeys.demoFileRow.all, "list"] as const,
    list: (filters: any) => [...queryKeys.demoFileRow.lists(), filters] as const,
    details: () => [...queryKeys.demoFileRow.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.demoFileRow.details(), id] as const,
  },
  // GoogleDrive
  googleDrive: {
    all: ["googleDrive"] as const,
    lists: () => [...queryKeys.googleDrive.all, "list"] as const,
    list: (filters: any) => [...queryKeys.googleDrive.lists(), filters] as const,
    details: () => [...queryKeys.googleDrive.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.googleDrive.details(), id] as const,
  },
  // AccountTypeMain
  accountTypeMain: {
    all: ["accountTypeMain"] as const,
    lists: () => [...queryKeys.accountTypeMain.all, "list"] as const,
    list: (filters: any) => [...queryKeys.accountTypeMain.lists(), filters] as const,
    details: () => [...queryKeys.accountTypeMain.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.accountTypeMain.details(), id] as const,
  },
  // Step
  step: {
    all: ["step"] as const,
    lists: () => [...queryKeys.step.all, "list"] as const,
    list: (filters: any) => [...queryKeys.step.lists(), filters] as const,
    details: () => [...queryKeys.step.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.step.details(), id] as const,
  },
  // DraftingStatus
  draftingStatus: {
    all: ["draftingStatus"] as const,
    lists: () => [...queryKeys.draftingStatus.all, "list"] as const,
    list: (filters: any) => [...queryKeys.draftingStatus.lists(), filters] as const,
    details: () => [...queryKeys.draftingStatus.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.draftingStatus.details(), id] as const,
  },
  // Drafting
  drafting: {
    all: ["drafting"] as const,
    lists: () => [...queryKeys.drafting.all, "list"] as const,
    list: (filters: any) => [...queryKeys.drafting.lists(), filters] as const,
    details: () => [...queryKeys.drafting.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.drafting.details(), id] as const,
  },
  // BuildingSpec
  buildingSpec: {
    all: ["buildingSpec"] as const,
    lists: () => [...queryKeys.buildingSpec.all, "list"] as const,
    list: (filters: any) => [...queryKeys.buildingSpec.lists(), filters] as const,
    details: () => [...queryKeys.buildingSpec.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.buildingSpec.details(), id] as const,
  },
  // BuildSpecTypeProblem
  buildSpecTypeProblem: {
    all: ["buildSpecTypeProblem"] as const,
    lists: () => [...queryKeys.buildSpecTypeProblem.all, "list"] as const,
    list: (filters: any) => [...queryKeys.buildSpecTypeProblem.lists(), filters] as const,
    details: () => [...queryKeys.buildSpecTypeProblem.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.buildSpecTypeProblem.details(), id] as const,
  },
  // BuildSpecStatus
  buildSpecStatus: {
    all: ["buildSpecStatus"] as const,
    lists: () => [...queryKeys.buildSpecStatus.all, "list"] as const,
    list: (filters: any) => [...queryKeys.buildSpecStatus.lists(), filters] as const,
    details: () => [...queryKeys.buildSpecStatus.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.buildSpecStatus.details(), id] as const,
  },
  // LicenceType
  licenceType: {
    all: ["licenceType"] as const,
    lists: () => [...queryKeys.licenceType.all, "list"] as const,
    list: (filters: any) => [...queryKeys.licenceType.lists(), filters] as const,
    details: () => [...queryKeys.licenceType.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.licenceType.details(), id] as const,
  },
  // Licence
  licence: {
    all: ["licence"] as const,
    lists: () => [...queryKeys.licence.all, "list"] as const,
    list: (filters: any) => [...queryKeys.licence.lists(), filters] as const,
    details: () => [...queryKeys.licence.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.licence.details(), id] as const,
  },
  // OtherServiceType
  otherServiceType: {
    all: ["otherServiceType"] as const,
    lists: () => [...queryKeys.otherServiceType.all, "list"] as const,
    list: (filters: any) => [...queryKeys.otherServiceType.lists(), filters] as const,
    details: () => [...queryKeys.otherServiceType.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.otherServiceType.details(), id] as const,
  },
  // OtherServiceStatus
  otherServiceStatus: {
    all: ["otherServiceStatus"] as const,
    lists: () => [...queryKeys.otherServiceStatus.all, "list"] as const,
    list: (filters: any) => [...queryKeys.otherServiceStatus.lists(), filters] as const,
    details: () => [...queryKeys.otherServiceStatus.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.otherServiceStatus.details(), id] as const,
  },
  // OtherServices
  otherServices: {
    all: ["otherServices"] as const,
    lists: () => [...queryKeys.otherServices.all, "list"] as const,
    list: (filters: any) => [...queryKeys.otherServices.lists(), filters] as const,
    details: () => [...queryKeys.otherServices.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.otherServices.details(), id] as const,
  },
  // BillStatus
  billStatus: {
    all: ["billStatus"] as const,
    lists: () => [...queryKeys.billStatus.all, "list"] as const,
    list: (filters: any) => [...queryKeys.billStatus.lists(), filters] as const,
    details: () => [...queryKeys.billStatus.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.billStatus.details(), id] as const,
  },
  // BillType
  billType: {
    all: ["billType"] as const,
    lists: () => [...queryKeys.billType.all, "list"] as const,
    list: (filters: any) => [...queryKeys.billType.lists(), filters] as const,
    details: () => [...queryKeys.billType.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.billType.details(), id] as const,
  },
  // InventoryType
  inventoryType: {
    all: ["inventoryType"] as const,
    lists: () => [...queryKeys.inventoryType.all, "list"] as const,
    list: (filters: any) => [...queryKeys.inventoryType.lists(), filters] as const,
    details: () => [...queryKeys.inventoryType.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.inventoryType.details(), id] as const,
  },
  // InventoryStatus
  inventoryStatus: {
    all: ["inventoryStatus"] as const,
    lists: () => [...queryKeys.inventoryStatus.all, "list"] as const,
    list: (filters: any) => [...queryKeys.inventoryStatus.lists(), filters] as const,
    details: () => [...queryKeys.inventoryStatus.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.inventoryStatus.details(), id] as const,
  },
  // Inventory
  inventory: {
    all: ["inventory"] as const,
    lists: () => [...queryKeys.inventory.all, "list"] as const,
    list: (filters: any) => [...queryKeys.inventory.lists(), filters] as const,
    details: () => [...queryKeys.inventory.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.inventory.details(), id] as const,
  },
  // TenancyTerms
  tenancyTerms: {
    all: ["tenancyTerms"] as const,
    lists: () => [...queryKeys.tenancyTerms.all, "list"] as const,
    list: (filters: any) => [...queryKeys.tenancyTerms.lists(), filters] as const,
    details: () => [...queryKeys.tenancyTerms.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.tenancyTerms.details(), id] as const,
  },
  // Tenancy
  tenancy: {
    all: ["tenancy"] as const,
    lists: () => [...queryKeys.tenancy.all, "list"] as const,
    list: (filters: any) => [...queryKeys.tenancy.lists(), filters] as const,
    details: () => [...queryKeys.tenancy.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.tenancy.details(), id] as const,
  },
  // Eviction
  eviction: {
    all: ["eviction"] as const,
    lists: () => [...queryKeys.eviction.all, "list"] as const,
    list: (filters: any) => [...queryKeys.eviction.lists(), filters] as const,
    details: () => [...queryKeys.eviction.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.eviction.details(), id] as const,
  },
  // EvictionStatus
  evictionStatus: {
    all: ["evictionStatus"] as const,
    lists: () => [...queryKeys.evictionStatus.all, "list"] as const,
    list: (filters: any) => [...queryKeys.evictionStatus.lists(), filters] as const,
    details: () => [...queryKeys.evictionStatus.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.evictionStatus.details(), id] as const,
  },
  // CertType
  certType: {
    all: ["certType"] as const,
    lists: () => [...queryKeys.certType.all, "list"] as const,
    list: (filters: any) => [...queryKeys.certType.lists(), filters] as const,
    details: () => [...queryKeys.certType.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.certType.details(), id] as const,
  },
  // CertResult
  certResult: {
    all: ["certResult"] as const,
    lists: () => [...queryKeys.certResult.all, "list"] as const,
    list: (filters: any) => [...queryKeys.certResult.lists(), filters] as const,
    details: () => [...queryKeys.certResult.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.certResult.details(), id] as const,
  },
  // Cert
  cert: {
    all: ["cert"] as const,
    lists: () => [...queryKeys.cert.all, "list"] as const,
    list: (filters: any) => [...queryKeys.cert.lists(), filters] as const,
    details: () => [...queryKeys.cert.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.cert.details(), id] as const,
  },
  // SurveyType
  surveyType: {
    all: ["surveyType"] as const,
    lists: () => [...queryKeys.surveyType.all, "list"] as const,
    list: (filters: any) => [...queryKeys.surveyType.lists(), filters] as const,
    details: () => [...queryKeys.surveyType.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.surveyType.details(), id] as const,
  },
  // SurveyStatus
  surveyStatus: {
    all: ["surveyStatus"] as const,
    lists: () => [...queryKeys.surveyStatus.all, "list"] as const,
    list: (filters: any) => [...queryKeys.surveyStatus.lists(), filters] as const,
    details: () => [...queryKeys.surveyStatus.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.surveyStatus.details(), id] as const,
  },
  // Survey
  survey: {
    all: ["survey"] as const,
    lists: () => [...queryKeys.survey.all, "list"] as const,
    list: (filters: any) => [...queryKeys.survey.lists(), filters] as const,
    details: () => [...queryKeys.survey.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.survey.details(), id] as const,
  },
  // Bill
  bill: {
    all: ["bill"] as const,
    lists: () => [...queryKeys.bill.all, "list"] as const,
    list: (filters: any) => [...queryKeys.bill.lists(), filters] as const,
    details: () => [...queryKeys.bill.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.bill.details(), id] as const,
  },
  // TranStatus
  tranStatus: {
    all: ["tranStatus"] as const,
    lists: () => [...queryKeys.tranStatus.all, "list"] as const,
    list: (filters: any) => [...queryKeys.tranStatus.lists(), filters] as const,
    details: () => [...queryKeys.tranStatus.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.tranStatus.details(), id] as const,
  },
  // Tran
  tran: {
    all: ["tran"] as const,
    lists: () => [...queryKeys.tran.all, "list"] as const,
    list: (filters: any) => [...queryKeys.tran.lists(), filters] as const,
    details: () => [...queryKeys.tran.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.tran.details(), id] as const,
  },
  // ConStatus
  conStatus: {
    all: ["conStatus"] as const,
    lists: () => [...queryKeys.conStatus.all, "list"] as const,
    list: (filters: any) => [...queryKeys.conStatus.lists(), filters] as const,
    details: () => [...queryKeys.conStatus.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.conStatus.details(), id] as const,
  },
  // Cons
  cons: {
    all: ["cons"] as const,
    lists: () => [...queryKeys.cons.all, "list"] as const,
    list: (filters: any) => [...queryKeys.cons.lists(), filters] as const,
    details: () => [...queryKeys.cons.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.cons.details(), id] as const,
  },
  // Tasks
  tasks: {
    all: ["tasks"] as const,
    lists: () => [...queryKeys.tasks.all, "list"] as const,
    list: (filters: any) => [...queryKeys.tasks.lists(), filters] as const,
    details: () => [...queryKeys.tasks.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
  },
  // Banks
  banks: {
    all: ["banks"] as const,
    lists: () => [...queryKeys.banks.all, "list"] as const,
    list: (filters: any) => [...queryKeys.banks.lists(), filters] as const,
    details: () => [...queryKeys.banks.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.banks.details(), id] as const,
  },
  // CompaniesHouse
  companiesHouse: {
    all: ["companiesHouse"] as const,
    lists: () => [...queryKeys.companiesHouse.all, "list"] as const,
    list: (filters: any) => [...queryKeys.companiesHouse.lists(), filters] as const,
    details: () => [...queryKeys.companiesHouse.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.companiesHouse.details(), id] as const,
  },
  // Hmrc
  hmrc: {
    all: ["hmrc"] as const,
    lists: () => [...queryKeys.hmrc.all, "list"] as const,
    list: (filters: any) => [...queryKeys.hmrc.lists(), filters] as const,
    details: () => [...queryKeys.hmrc.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.hmrc.details(), id] as const,
  },
  // Lists
  lists: {
    all: ["lists"] as const,
    lists: () => [...queryKeys.lists.all, "list"] as const,
    list: (filters: any) => [...queryKeys.lists.lists(), filters] as const,
    details: () => [...queryKeys.lists.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.lists.details(), id] as const,
  },
  // Reports
  reports: {
    all: ["reports"] as const,
    lists: () => [...queryKeys.reports.all, "list"] as const,
    list: (filters: any) => [...queryKeys.reports.lists(), filters] as const,
    details: () => [...queryKeys.reports.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.reports.details(), id] as const,
  },
  // Dataset
  dataset: {
    all: ["dataset"] as const,
    lists: () => [...queryKeys.dataset.all, "list"] as const,
    list: (filters: any) => [...queryKeys.dataset.lists(), filters] as const,
    details: () => [...queryKeys.dataset.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.dataset.details(), id] as const,
  },
  // DepartmentsFunc
  departmentsFunc: {
    all: ["departmentsFunc"] as const,
    lists: () => [...queryKeys.departmentsFunc.all, "list"] as const,
    list: (filters: any) => [...queryKeys.departmentsFunc.lists(), filters] as const,
    details: () => [...queryKeys.departmentsFunc.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.departmentsFunc.details(), id] as const,
  },
  // Projects
  projects: {
    all: ["projects"] as const,
    lists: () => [...queryKeys.projects.all, "list"] as const,
    list: (filters: any) => [...queryKeys.projects.lists(), filters] as const,
    details: () => [...queryKeys.projects.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
  },
  // Messages
  messages: {
    all: ["messages"] as const,
    lists: () => [...queryKeys.messages.all, "list"] as const,
    list: (filters: any) => [...queryKeys.messages.lists(), filters] as const,
    details: () => [...queryKeys.messages.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.messages.details(), id] as const,
  },
  // Message-detailled
  messagedetailled: {
    all: ["messagedetailled"] as const,
    lists: () => [...queryKeys.messagedetailled.all, "list"] as const,
    list: (filters: any) => [...queryKeys.messagedetailled.lists(), filters] as const,
    details: () => [...queryKeys.messagedetailled.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.messagedetailled.details(), id] as const,
  },
  // Project-user-permissions
  projectuserpermissions: {
    all: ["projectuserpermissions"] as const,
    lists: () => [...queryKeys.projectuserpermissions.all, "list"] as const,
    list: (filters: any) => [...queryKeys.projectuserpermissions.lists(), filters] as const,
    details: () => [...queryKeys.projectuserpermissions.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.projectuserpermissions.details(), id] as const,
  },
  // AssignTask
  assignTask: {
    all: ["assignTask"] as const,
    lists: () => [...queryKeys.assignTask.all, "list"] as const,
    list: (filters: any) => [...queryKeys.assignTask.lists(), filters] as const,
    details: () => [...queryKeys.assignTask.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.assignTask.details(), id] as const,
  },
};
