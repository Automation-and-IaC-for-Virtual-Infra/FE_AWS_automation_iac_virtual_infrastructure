import { NextResponse } from 'next/server'
import { listServices } from './lib/data'

const AWS_CLOUD_FORMATION_URL =
  'https://d1uauaxba7bl26.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json'

export async function GET() {
  try {
    const res = await fetch(AWS_CLOUD_FORMATION_URL, {
      next: { revalidate: 86400 * 7 }, // Revalidate once a week
      signal: AbortSignal.timeout(10000), // 10 seconds timeout
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch CloudFormation spec' }, { status: 500 })
    }

    const spec = await res.json()

    // Mapping services
    const services = Object.entries(spec.ResourceTypes).map(
      ([resourceName, details]: [string, any]) => ({
        name: resourceName,
        documentation: details.Documentation || '',
        properties: details.Properties || {},
      })
    )

    const updatedAwsServiceData = listServices.map((svc) => {
      const match = services.find((s) => s.name === svc.resourceType)
      if (match) {
        svc.properties = match.properties
      }
      return svc
    })

    return NextResponse.json({
      count: updatedAwsServiceData.length,
      services: updatedAwsServiceData,
    })

    // return NextResponse.json({ count: awsServiceData.length, services: awsServiceData })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch AWS services' }, { status: 500 })
  }
}
