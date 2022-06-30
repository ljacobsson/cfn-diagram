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
  "AWS::Serverless::HttpApi": {
    icon: "mxgraph.aws4.api_gateway",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::Serverless::StateMachine": {
    icon: "mxgraph.aws4.step_functions",
    serviceType: "applicationintegration",
  },
  "AWS::Lambda::Permission": {
    icon: "mxgraph.aws4.policy",
    serviceType: "securityidentitycomplicance",
  },
  "AWS::IAM::Role": {
    icon: "mxgraph.aws4.role",
    serviceType: "securityidentitycomplicance",
  },
  "AWS::SSM::Parameter": {
    icon: "mxgraph.aws4.parameter_store",
    serviceType: "managementgovernance",
  },
  "AWS::Logs::LogGroup": {
    icon: "mxgraph.aws4.cloudwatch",
    serviceType: "managementgovernance",
  },
  "AWS::EC2::Route": {
    icon: "mxgraph.aws4.route_table",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::EC2::RouteTable": {
    icon: "mxgraph.aws4.route_table",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::EC2::SubnetRouteTableAssociation": {
    icon: "mxgraph.aws4.route_table",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::EC2::VPC": {
    icon: "mxgraph.aws4.vpc",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::EC2::NatGateway": {
    icon: "mxgraph.aws4.nat_gateway",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::EC2::EIP": {
    icon: "mxgraph.aws4.elastic_ip_address",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::ApiGateway::RestApi": {
    icon: "mxgraph.aws4.api_gateway",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::ApiGateway::Method": {
    icon: "mxgraph.aws4.api_gateway",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::ApiGateway::Deployment": {
    icon: "mxgraph.aws4.api_gateway",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::ApiGateway::Resource": {
    icon: "mxgraph.aws4.api_gateway",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::ApiGateway::Stage": {
    icon: "mxgraph.aws4.api_gateway",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::ApiGateway::Account": {
    icon: "mxgraph.aws4.api_gateway",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::ApiGateway::Account": {
    icon: "mxgraph.aws4.api_gateway",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::WAF::WebACL": {
    icon: "mxgraph.aws4.waf",
    serviceType: "securityidentitycomplicance",
  },
  "AWS::WAF::WebACLAssociation": {
    icon: "mxgraph.aws4.waf",
    serviceType: "securityidentitycomplicance",
  },
  "AWS::WAFv2::WebACL": {
    icon: "mxgraph.aws4.waf",
    serviceType: "securityidentitycomplicance",
  },
  "AWS::WAFv2::WebACLAssociation": {
    icon: "mxgraph.aws4.waf",
    serviceType: "securityidentitycomplicance",
  },
  "AWS::ApiGatewayV2::Api": {
    icon: "mxgraph.aws4.api_gateway",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::ApiGatewayV2::ApiGatewayManagedOverrides": {
    icon: "mxgraph.aws4.api_gateway",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::ApiGatewayV2::ApiMapping": {
    icon: "mxgraph.aws4.api_gateway",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::ApiGatewayV2::Authorizer": {
    icon: "mxgraph.aws4.api_gateway",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::ApiGatewayV2::Deployment": {
    icon: "mxgraph.aws4.api_gateway",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::ApiGatewayV2::DomainName": {
    icon: "mxgraph.aws4.api_gateway",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::ApiGatewayV2::Integration": {
    icon: "mxgraph.aws4.api_gateway",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::ApiGatewayV2::IntegrationResponse": {
    icon: "mxgraph.aws4.api_gateway",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::ApiGatewayV2::Model": {
    icon: "mxgraph.aws4.api_gateway",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::ApiGatewayV2::Route": {
    icon: "mxgraph.aws4.api_gateway",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::ApiGatewayV2::RouteResponse": {
    icon: "mxgraph.aws4.api_gateway",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::ApiGatewayV2::Stage": {
    icon: "mxgraph.aws4.api_gateway",
    serviceType: "networkingcontentdelivery",
  },
  "AWS::ApiGatewayV2::VpcLink": {
    icon: "mxgraph.aws4.api_gateway",
    serviceType: "networkingcontentdelivery",
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
    fillColor: "#5A30B5",
    gradientColor: "#945DF2",
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
  events: "eventbridge",
  logs: "cloudwatch",
};

export function getIcon(type) {
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

export default {
  getIcon,
};
