import { NextResponse } from "next/server"

const AWS_CLOUD_FORMATION_URL =
  "https://d1uauaxba7bl26.cloudfront.net/latest/gzip/CloudFormationResourceSpecification.json"

export async function GET() {
  try {
    const res = await fetch(AWS_CLOUD_FORMATION_URL)
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch CloudFormation spec" }, { status: 500 })
    }

    const spec = await res.json()
    const resourceTypes = spec.ResourceTypes

    // Mapping services
    const services = Object.entries(resourceTypes).map(([resourceName, details]: [string, any]) => ({
      name: resourceName,
      documentation: details.Documentation || "",
      properties: details.Properties || {},
    }))

    return NextResponse.json({ count: services.length, services })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch AWS services" }, { status: 500 })
  }
}
