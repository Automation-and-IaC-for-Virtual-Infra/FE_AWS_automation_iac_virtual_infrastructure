import { NextResponse } from 'next/server'
import { awsServiceData } from './lib/data'

// const AWS_CLOUD_FORMATION_URL =
//   'https://d1uauaxba7bl26.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json'

// const allowedServices = [
//   'IAM',
//   'EC2',
//   'ElasticLoadBalancingV2',
//   'AutoScaling',
//   'RDS',
//   'S3',
//   'CloudFront',
//   'SQS',
//   'SNS',
//   'Kinesis',
//   'AmazonMQ',
//   'ApiGateway',
//   'Lambda',
//   'StepFunctions',
//   'Cognito',
//   'DynamoDB',
//   'DocDB',
//   'Neptune',
//   'Timestream',
//   'Athena',
//   'Redshift',
//   'OpenSearchService',
//   'CloudWatch',
//   'CloudTrail',
//   'Config',
//   'KMS',
//   'SSM',
//   'WAFv2',
//   'EFS',
//   'ElasticLoadBalancing', // LB cũ
//   'EC2::VPC',
//   'EC2::Subnet',
//   'EC2::NatGateway',
//   'EC2::InternetGateway',
//   'EC2::NetworkAcl',
//   'EC2::SecurityGroup',
// ]

export async function GET() {
  try {
    // const res = await fetch(AWS_CLOUD_FORMATION_URL)
    // if (!res.ok) {
    //   return NextResponse.json({ error: 'Failed to fetch CloudFormation spec' }, { status: 500 })
    // }

    // const spec = await res.json()
    // const filtered = Object.entries(spec.ResourceTypes).filter(([name]) =>
    //   allowedServices.some((service) => name.includes(service))
    // )

    // // Mapping services
    // const services = filtered.map(([resourceName, details]: [string, any]) => ({
    //   name: resourceName,
    //   documentation: details.Documentation || '',
    //   properties: details.Properties || {},
    // }))

    return NextResponse.json({ count: awsServiceData.length, services: awsServiceData })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch AWS services' }, { status: 500 })
  }
}
