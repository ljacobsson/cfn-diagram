const icons = {
  "AWS::Serverless::Function": {
    icon: "mxgraph.aws4.lambda",
    serviceType: "compute",
  },
  "AWS::Serverless::SimpleTable": {
    icon: "mxgraph.aws4.dynamodb",
    serviceType: "database",
  },
  "AWS::Serverless::Api": {
    icon: "mxgraph.aws4.api_gateway",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::IAM::Role": {
    icon: "mxgraph.aws4.role",
    serviceType: "securityidentitycomplicance",
  },
};

const colors = {
  analytics: {
    gradientColor: "#945DF2",
    fillColor: "#5A30B5",
  },
  applicationintegration: {
    fillColor: "#BC1356",
    gradientColor: "#F34482",
  },
  blockchain: {
    fillColor: "#D05C17",
    gradientColor: "#F78E04",
  },
  managementgovernance: {
    fillColor: "#BC1356",
    gradientColor: "#F34482",
  },
  compute: {
    fillColor: "#D05C17",
    gradientColor: "#F78E04",
  },
  containers: {
    fillColor: "#D05C17",
    gradientColor: "#F78E04",
  },
  database: {
    fillColor: "#3334B9",
    gradientColor: "#4D72F3",
  },
  networkingcontentdelivery: {
    fillColor: "#945DF2",
    gradientColor: "#60A337",
  },
  securityidentitycomplicance: {
    fillColor: "#C7131F",
    gradientColor: "#F54749",
  },
  storage: {
    fillColor: "#277116",
    gradientColor: "#60A337",
  },
};

const serviceTypeMap = {
  Athena: "analytics",
  CloudSearch: "analytics",
  ElasticsearchService: "analytics",
  EMR: "analytics",
  Kinesis: "analytics",
  MSK: "analytics",
  Redshift: "analytics",
  QuickSight: "analytics",
  DataExchange: "analytics",
  DataPipeline: "analytics",
  Glue: "analytics",
  LakeFormation: "analytics",
  StepFunctions: "applicationintegration",
  AppFlow: "applicationintegration",
  EventBridge: "applicationintegration",
  Events: "applicationintegration",
  MQ: "applicationintegration",
  SNS: "applicationintegration",
  SQS: "applicationintegration",
  AppSync: "applicationintegration",
  ManagedBlockchain: "blockchain",
  CloudWatch: "managementgovernance",
  AutoScaling: "managementgovernance",
  Chatbot: "managementgovernance",
  CloudFormation: "managementgovernance",
  CloudTrail: "managementgovernance",
  ComputeOptimizer: "managementgovernance",
  Config: "managementgovernance",
  ControlTower: "managementgovernance",
  ConsoleMobileApplication: "managementgovernance",
  LicenseManager: "managementgovernance",
  OpsWorks: "managementgovernance",
  Organizations: "managementgovernance",
  ServiceCatalog: "managementgovernance",
  SystemsManager: "managementgovernance",
  TrustedAdvisor: "managementgovernance",
  EC2: "compute",
  AutoScaling: "compute",
  Lightsail: "compute",
  Batch: "compute",
  ElasticBeanstalk: "compute",
  Lambda: "compute",
  Outposts: "compute",
  ServerlessApplicationRepository: "compute",
  Wavelength: "compute",
  ElasticContainerRegistry: "containers",
  ECS: "containers",
  EKS: "containers",
  Fargate: "containers",
  Aurora: "database",
  DynamoDB: "database",
  DocumentDB: "database",
  ElastiCache: "database",
  Keyspaces: "database",
  Neptune: "database",
  QuantumLedgerDatabase: "database",
  RDS: "database",
  RDSonVMware: "database",
  Redshift: "database",
  Timestream: "database",
  DatabaseMigrationService: "database",
  VPC: "networkingcontentdelivery",
  APIGateway: "networkingcontentdelivery",
  CloudFront: "networkingcontentdelivery",
  Route53: "networkingcontentdelivery",
  PrivateLink: "networkingcontentdelivery",
  AppMesh: "networkingcontentdelivery",
  CloudMap: "networkingcontentdelivery",
  DirectConnect: "networkingcontentdelivery",
  GlobalAccelerator: "networkingcontentdelivery",
  TransitGateway: "networkingcontentdelivery",
  ElasticLoadBalancing: "networkingcontentdelivery",
  IAM: "securityidentitycomplicance",
  Cognito: "securityidentitycomplicance",
  Detective: "securityidentitycomplicance",
  GuardDuty: "securityidentitycomplicance",
  Inspector: "securityidentitycomplicance",
  Macie: "securityidentitycomplicance",
  Artifact: "securityidentitycomplicance",
  CertificateManager: "securityidentitycomplicance",
  CloudHSM: "securityidentitycomplicance",
  DirectoryService: "securityidentitycomplicance",
  FirewallManager: "securityidentitycomplicance",
  KMS: "securityidentitycomplicance",
  ResourceAccessManager: "securityidentitycomplicance",
  SecretsManager: "securityidentitycomplicance",
  SecurityHub: "securityidentitycomplicance",
  Shield: "securityidentitycomplicance",
  WAF: "securityidentitycomplicance",
  S3: "storage",
  EBS: "storage",
  EFS: "storage",
  Backup: "storage",
  SnowFamily: "storage",
  StorageGateway: "storage",
};

const serviceTranslation = {
  iam: "identity_and_access_management",
  kms: "key_management_service",
  stepfunctions: "step_functions",
  events: "eventbridge"
};

function getIcon(type) {
  let icon = icons[type];
  if (icon) {
    icon.fillColor = colors[icon.serviceType].fillColor;
    icon.gradientColor = colors[icon.serviceType].gradientColor;
  } else {
    const serviceName = type.split("::")[1];
    const group = serviceTypeMap[serviceName];
    const color = colors[group];
    const translatedName = serviceTranslation[serviceName.toLowerCase()];
    icon = {
      icon: "mxgraph.aws4." + (translatedName || serviceName.toLowerCase()),
      fillColor: color ? color.fillColor : "#aaaaaa",
      gradientColor: color ? color.gradientColor : "#aaaaaa",
    };
  }

  return `outlineConnect=0;fontColor=#B3B3B3;gradientColor=${icon.gradientColor};gradientDirection=north;fillColor=${icon.fillColor};strokeColor=#ffffff;dashed=0;verticalLabelPosition=bottom;verticalAlign=top;align=center;html=1;fontSize=12;fontStyle=0;aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon=${icon.icon};`;
}

module.exports = {
  getIcon,
};
