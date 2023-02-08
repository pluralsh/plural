enum ConfigurationType {
  STRING = 'STRING',
  BOOL = 'BOOL',
  INT = 'INT',
  DOMAIN = 'DOMAIN',
  BUCKET = 'BUCKET',
  PASSWORD = 'PASSWORD',
}

enum OperationType {
  NOT = 'NOT',
  PREFIX = 'PREFIX',
  EQUAL = 'EQ',
}

export { ConfigurationType, OperationType }
